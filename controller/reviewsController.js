const reviewsSchema = require('../models/reviewsAndRatings');
const orderSchema = require('../models/orderSchema');
const productSchema = require('../models/productSchema');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
//cloudinary imports
const cloudinary = require('cloudinary').v2;
//all controllers for reviews handlers



//create review
const createReview = async (req, res) => {
  try {
    const { userId, review, rating, pId, subCategory, subTypeChild } = req.body;
    let image_uri = "";
    const fileData = req.file;//this is optiional as depends on user if he prpovides or not no nedd to validate its input
    if (fileData) {
      //write cloudinary optimization routes here and mive further
      const uploadResult = await cloudinary.uploader
        .upload(
          fileData.path, {
          public_id: fileData.orignalname,
        }
        )
        .catch((error) => {
          console.log(error);
        });

      console.log(uploadResult);

      //getting url for store in database
      image_uri = await cloudinary.url(uploadResult.public_id);
      //at this point we have cloudinary url need to stoer them
      //better option to be done in below single entry call

    }
    console.log("filedata as customer is ", fileData);
    //before creating review check weather user actually buiyed that particular product
    const [userDspecificorders] = await orderSchema.find({ user: userId });
    console.log("users orders details found", userDspecificorders?.orders);
    if (!userDspecificorders || !userDspecificorders.orders || userDspecificorders.orders.length === 0) {
      return res.status(400).send({
        success: false,
        message: 'No orders found for this user',
        isBought: false
      });
    }
    const boughtProducts = userDspecificorders?.orders.map(order => order.product);
    console.log("baught", boughtProducts);
    const weatherBuyedOrNot = boughtProducts.some(id => id.equals(pId));
    if (weatherBuyedOrNot) {
      console.log("bought already!");
    } else {
      return res.status(301).send({
        success: false,
        message: 'Buy the product first and then provide ratings',
        isBought: false
      });
    }

    //at this stage there is conformation of user buiyed that productactually so he can provide her trur ratings

    const reviewEntry = new reviewsSchema({
      user: userId,
      reviewText: review,
      starRating: rating,
      product: pId,
      photoUrl: image_uri,
      subCategory: subCategory,
      subTypeChild: subTypeChild
    });
    await reviewEntry.save();
    console.log("review added successfully");
    // Update the product with the new review means push review id inside product
    // 1)find the product first whose ratings you wanna add
    const product = await productSchema.findById(pId).populate('reviews subCategory');
    // console.log("product found successfully"); herer we have found product whose review we wanna add
    await product.reviews.push(reviewEntry._id);
    //also increase revuiew count as new review pushed into oarticular priduct
    await product.updateOne({ $inc: { reviewsTotal: 1 } });
    console.log("review count increased");
    await product.save();
    console.log("review linked with partiular product");
    //at this stage review id linked with particula product
    // 2)find particular product with particular starts and multiply them with theire response factor as: 4:4*total 4 response
    // const thressStartRes = await product.response.reviews.map((review) => {
    //   return review.starRating == 3
    // });
    const starRatings = await productSchema.aggregate([{
      $match: { _id: new mongoose.Types.ObjectId(pId) }
    }, {
      $lookup:
      {
        from: 'reviews',
        localField: 'reviews',
        foreignField: '_id',
        as: 'reviewsForeign'
      }
    }, {
      $unwind: '$reviewsForeign'
    }, { $project: { "reviewsForeign": 1 } }, {
      $facet: {
        oneStar: [{ $match: { "reviewsForeign.starRating": 1 } }, { $count: "oneStarRatingsRecords" }],
        twoStar: [{ $match: { "reviewsForeign.starRating": 2 } }, { $count: "twoStarRatingsRecords" }],
        threeStar: [{ $match: { "reviewsForeign.starRating": 3 } }, { $count: "threeStarRatingsRecords" }],
        fourStar: [{ $match: { "reviewsForeign.starRating": 4 } }, { $count: "fourStarRatingsRecords" }],
        fiveStar: [{ $match: { "reviewsForeign.starRating": 5 } }, { $count: "fiveStarRatingsRecords" }],
      }
    }]);
    console.log("review having three star", starRatings[0].threeStar);
    //return necessary dara as:
    // 1)total review
    //2)average of all
    //3)particular review score
    //4)text reviews

    //getting individual values
    const counts = starRatings[0]; // Access the first element of the result array
    const oneStarCount = counts.oneStar.length > 0 ? counts.oneStar[0].oneStarRatingsRecords : 0;
    const twoStarCount = counts.twoStar.length > 0 ? counts.twoStar[0].twoStarRatingsRecords : 0;
    const threeStarCount = counts.threeStar.length > 0 ? counts.threeStar[0].threeStarRatingsRecords : 0;
    const fourStarCount = counts.fourStar.length > 0 ? counts.fourStar[0].fourStarRatingsRecords : 0;
    const fiveStarCount = counts.fiveStar.length > 0 ? counts.fiveStar[0].fiveStarRatingsRecords : 0;


    // Calculate the average total count
    const totalRatingsCount = oneStarCount + twoStarCount + threeStarCount + fourStarCount + fiveStarCount;
    const weightedSum = (1 * oneStarCount) + (2 * twoStarCount) + (3 * threeStarCount) + (4 * fourStarCount) + (5 * fiveStarCount);
    const averageRating = totalRatingsCount > 0 ? (weightedSum / totalRatingsCount).toFixed(1) : 0;

    //try returning sub cat analytics from here with the help of pipelines
    console.log("product subcategories", product.subCategory);//['display','battery','performance'];
    console.log("product id validator", product._id);
    const resultSet = await reviewsSchema.aggregate([{
      $match: {
        product: product._id.toString()
      }
    },
    {
      $match: {
        subTypeChild: {
          $in: product.subCategory.reviewsCategory
        }
      }
    },
    {
      $group: {
        _id: "$subTypeChild",
        count: { $sum: 1 }
      }
    },
    {
      $addFields: {
        percentage: {
          $multiply: [
            { $divide: ["$count", totalRatingsCount] }, // Calculate proportion
            100 // Convert to percentage
          ]
        }
      }
    }

    ]);
    const allSubReviewSections = product.subCategory.reviewsCategory.map(category => ({
      _id: category,
      count: 0,
      percentage: 0
    }));
    const resultMap = new Map(resultSet.map(item => [item._id, item]));
    const updatedSections = allSubReviewSections.map(section => {
      const result = resultMap.get(section._id); // Lookup in resultMap
      return result ? result : section; // Replace with actual result if found, otherwise keep default
    });
    //test resultset
    console.log("final resultset", updatedSections);
    //assign resultset percentages values inside products arrra7 fie;d to display
    const percentages = updatedSections.map(item => item.percentage);

    product.subSecReviewsPercent = percentages;

    //here correctly set particular start ratings for product records
    product.oneStar = oneStarCount;
    product.twoStar = twoStarCount;
    product.threeStar = threeStarCount;
    product.fourStar = fourStarCount;
    product.fiveStar = fiveStarCount;

    //update that values in prpduct schema at time of next retrival they will be populated
    product.averageRating = averageRating;
    await product.save();



    //return response from api as an frontend supplier
    return res.status(201).send({
      success: true,
      individualRating: { one: oneStarCount, two: twoStarCount, three: threeStarCount, four: fourStarCount, five: fiveStarCount },
      totalRatings: totalRatingsCount,
      averageRating: averageRating,
      totalReviews: product.reviews
    });


  }
  catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
}
//controlller which provides review information based on product id as reference param
const getReviewsInformations = async (req, res) => {
  try {
    //retrived data with tge help of product ud arrived from param
    const { pId } = req.params;
    //retrived data based on pId and send inly necessary fields to frontend as claen object
    const information = await productSchema.findById({ _id: pId }).populate({
      path: 'reviews',
      populate: {
        path: 'user',
      }
    }).select('reviews averageRating reviewsTotal oneStar twoStar threeStar fourStar fiveStar subSecReviewsPercent');
    if (information) {
      console.log("product found!", information);
      //at this pipeline we have 1)total reviews count 2)reviews from customer as text 3)average rating in terms of stars
      return res.status(200).send({
        totalReviews: information.reviewsTotal,
        averageRating: information.averageRating,
        textReiews: information.reviews,
        individualRatings: {
          oneStar: information.oneStar,
          twoStar: information.twoStar,
          threeStar: information.threeStar,
          fourStar: information.fourStar,
          fiveStar: information.fiveStar
        },
        percentGrp:information.subSecReviewsPercent,
        subSectionLength:information.subSecReviewsPercent.length
      });
    }
    else {
      return res.status(401).send({
        success: false,
        message: 'product with given param was not found otherwise param is undefined',
      });
    }
  }
  catch (err) {
    res.status(401).send({
      success: false,
      message: 'error fetch data from api',
      problem: err.message
    });
  }
}
module.exports = { createReview, getReviewsInformations };
