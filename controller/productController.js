var fs = require('fs');
var http = require('http');
const { client } = require('../config/redisClient');
const productSchema = require('../models/productSchema');
// const transactionHistory = require('../models/transactionHistory');
const orderSchema = require('../models/orderSchema');
const slugify = require('slugify');
const { getEnabledCategories } = require('trace_events');
const braintree = require("braintree");
const { captureRejectionSymbol } = require('events');
//stripe imports
const YOUR_DOMAIN = 'https://e-commerse-frontend.vercel.app';
var formidable = require('formidable');
const transactionHistory = require('../models/transactionHistory');
const stripe = require('stripe')(process.env.stripe_secret_key);
const cloudinary = require('cloudinary').v2;

// const { default: ProductsDisplayer } = require('../frontend/src/admin/ProductsDisplayer');
//creating product
//payment gateway integration
//gateway braintree server side setup
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: "fhswh6r7cg6vrxh4",
    publicKey: "k33qy3y36hkvz7cn",
    privateKey: "dd9933170e7b034182bf7c8b05a58371"
});
//v1 product controller
// const productController = async (req, res) => {
//     try {
//         const { name, description, slug, price, category, quantity, shipping } = req.fields;
//         const { filedata0, filedata1, filedata2, filedata3 } = req.files;
//         // console.log("filedata",filedata);
//         switch (true) {
//             case !name:
//                 return res.status(301).send({ success: false, message: 'name not arriven' });
//             case !description:
//                 return res.status(301).send({ success: false, message: 'description not arriven' });
//             case !quantity:
//                 return res.status(301).send({ success: false, message: 'quantity not arriven' });
//             case !category:
//                 return res.status(301).send({ success: false, message: 'categiry not arriven' });
//             case filedata0 && filedata0.size > 1 * 1024 * 1024:
//                 return res.status(301).send({ success: false, message: 'photo required but less than 1 mb' });
//             case !shipping:
//                 return res.status(301).send({ success: false, message: 'shippiong status not arriven' });
//             case !filedata0:
//                 return res.status(301).send({ success: false, message: 'photo not arriven' });

//         }
//         // const form = formidable();

//         // form.parse(req, async (error, fieldsMultiple, files) => {
//         //     console.log("progress....");
//         //     if (error) {
//         //         console.error('Form parsing error:', error.message);
//         //         return res.status(500).send({
//         //             success: false,
//         //             message: 'Form parsing error',
//         //             error: error.message,
//         //         });
//         //     }
//         //     console.log('Fields:', fieldsMultiple);
//         //     console.log('Files:', files);
//         //     return res.status(201).send({
//         //         success: true,
//         //         message: 'Product created successfully',

//         //     });
//         // });

//         const entry = new productSchema({ ...req.fields, slug: slugify(name) });
//         if (filedata0) {
//             entry.photo.data = fs.readFileSync(filedata0.path);
//             entry.photos.push({ data: fs.readFileSync(filedata0.path), contentType: filedata0.contentType });
//             entry.photo.contentType = filedata0.type;
//         }
//         if (filedata1) {
//             entry.photos.push({ data: fs.readFileSync(filedata1.path), contentType: filedata1.contentType });
//         }
//         if (filedata2) {
//             entry.photos.push({ data: fs.readFileSync(filedata2.path), contentType: filedata2.contentType });
//         }
//         if (filedata3) {
//             entry.photos.push({ data: fs.readFileSync(filedata3.path), contentType: filedata3.contentType });
//         }
//         await entry.save();
//         res.status(201).send({
//             success: true,
//             message: 'product added successfully',
//             file0: filedata0,
//             file1: filedata1
//         });

//     }
//     catch (error) {
//         res.status(601).send({
//             success: false,
//             message: 'unable to create product',
//             error: error.message
//         });
//     }
// }
//first try
// const productController = async (req, res) => {
//     try {
//         console.log('Starting to process the request...');

//         var form = new formidable.IncomingForm();

//         // Log when starting to parse
//         console.log('Parsing form...');
//         await form.parse(req, function (err, fields, files) {
//             if (err) {
//                 console.log(err.message);
//             }
//             else {
//                 res.write('File uploaded');
//                 res.end();
//             }

//         });
//         console.log("form parsed");

//     } catch (error) {
//         console.error('Unable to create product:', error.message);
//         return res.status(500).send({
//             success: false,
//             message: 'Unable to create product',
//             error: error.message,
//         });
//     }
// };

//v2 product controller
const productController = async (req, res) => {
    try {
        const { name, description, slug, price, category, subCategory, quantity, shipping } = await req.body;
        var file = await req.files;
        switch (true) {
            case !name:
                return res.status(301).send({ success: false, message: 'name not arriven' });
            case !description:
                return res.status(301).send({ success: false, message: 'description not arriven' });
            case !quantity:
                return res.status(301).send({ success: false, message: 'quantity not arriven' });
            case !category:
                return res.status(301).send({ success: false, message: 'categiry not arriven' });
            case !subCategory:
                return res.status(301).send({ success: false, message: 'subCategory not arriven' });
            // case filedata0 && filedata0.size > 1 * 1024 * 1024:
            //     return res.status(301).send({ success: false, message: 'photo required but less than 1 mb' });
            case !shipping:
                return res.status(301).send({ success: false, message: 'shippiong status not arriven' });
            // case !filedata0:
            //     return res.status(301).send({ success: false, message: 'photo not arriven' });

        }
        // const form = formidable();

        // form.parse(req, async (error, fieldsMultiple, files) => {
        //     console.log("progress....");
        //     if (error) {
        //         console.error('Form parsing error:', error.message);
        //         return res.status(500).send({
        //             success: false,
        //             message: 'Form parsing error',
        //             error: error.message,
        //         });
        //     }
        //     console.log('Fields:', fieldsMultiple);
        //     console.log('Files:', files);
        //     return res.status(201).send({
        //         success: true,
        //         message: 'Product created successfully',

        //     });
        // });

        // const entry = new productSchema({ ...req.fields, slug: slugify(name) });
        // if (filedata0) {
        //     entry.photo.data = fs.readFileSync(filedata0.path);
        //     entry.photos.push({ data: fs.readFileSync(filedata0.path), contentType: filedata0.contentType });
        //     entry.photo.contentType = filedata0.type;
        // }
        // if (filedata1) {
        //     entry.photos.push({ data: fs.readFileSync(filedata1.path), contentType: filedata1.contentType });
        // }
        // if (filedata2) {
        //     entry.photos.push({ data: fs.readFileSync(filedata2.path), contentType: filedata2.contentType });
        // }
        // if (filedata3) {
        //     entry.photos.push({ data: fs.readFileSync(filedata3.path), contentType: filedata3.contentType });
        // }
        // await entry.save();

        //here you have to write uploader endpoints calls
        const optimizedUrls = [];//store url temprory insidee this arr
        // console.log("tesuehksdfn",Array.isArray(file));
        const after = file.map(async (item) => {
            const result = await cloudinary.uploader.upload(item.path, { resource_type: item.mimetype.startsWith('video/') ? 'video' : 'image', overwrite: true, notification_url: "https://mysite.example.com/notify_endpoint" });
            const optimizeUrl = result.secure_url;
            optimizedUrls.push(optimizeUrl);
        });
        const uploadResults = await Promise.all(after);
        // for (const image in file) {
        //     // console.log('filedata', file[image]);
        //     const result = await cloudinary.uploader.upload(file[image].path);
        //     const optimizeUrl = result.secure_url;
        //     optimizedUrls.push(optimizeUrl);
        // }
        //after this create database entry to store received photos url
        const entry = await new productSchema({ ...req.body, slug: slugify(name), photos: optimizedUrls });
        await entry.save();
        res.status(201).send({
            success: true,
            message: 'product added successfully',
            data_uploaded: optimizedUrls
        });

    }
    catch (error) {
        res.status(601).send({
            success: false,
            message: 'unable to create product',
            error: error.message
        });
    }
}


//api to get all products
const getAllproducts = async (req, res) => {
    try {
        const { offset } = req.params;
        const cacheKey = `products:${offset}`;

        //check weather data is present in cache or not
        const cachedProducts = await client.get(cacheKey);
        if (cachedProducts) {
            console.log("data found inside cache");
            return res.status(200).send({
                success: true,
                message: 'products fetched successfully from cache',
                data: JSON.parse(cachedProducts)
            });

        }
        //otherwise fetch from database as normal hitting
        // console.log(offset);
        const products = await productSchema.find().sort({ createdAt: -1 }).populate('category').skip(offset).limit(6).select('_id name price photos description');
        if (products) {
            client.set(cacheKey, JSON.stringify(products), 'EX', 3600);
            res.status(201).send({
                total: products.length,
                success: true,
                message: 'products fetched successfully',
                data: products
            });
        }
        else {
            res.status(601).send({
                success: false,
                message: 'error while fetching categories from database',
                error: error
            });
        }

    }
    catch (error) {
        res.status(601).send({
            success: false,
            message: 'error while fetching categories',
            error: error.message
        });
    }
}

//controller for getting single product
const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { sortBy } = req.query;
        let sortingOptions = {};

        if (sortBy === 'date') {
            console.log("arrived filters for sorting....");
            sortingOptions = { 'createdAt': -1 }
        }
        else if (sortBy == 'rating') {
            sortingOptions = { 'starRating': -1 }
        }

        console.log("soptions", sortBy);
        console.log("soptionsAdv", sortingOptions);

        const product = await productSchema.findOne({ '_id': id })
            .select('-photo').populate({
                path: 'reviews',
                options: { sort: sortingOptions }
            }).populate('category subCategory');
        if (product) {

            res.status(201).send({
                success: true,
                messagee: 'single product fetched successfully',
                data: product
            });
        }
        else {
            res.status(401).send({
                success: false,
                message: 'error while fetching from dataset'
            });
        }


    }
    catch (err) {
        res.status(401).send({
            success: false,
            messgae: 'error while fetching single prpduct',
            error: err
        });
    }
}
//controller for getting photo   
const getPhoto = async (req, res) => {
    try {
        // console.log("arrived inside controller........");
        const { id } = req.params;
        // console.log("id" + id);
        // const photo = await productSchema.findById(id).select('photo');
        const photos = await productSchema.findById(id).select('photos');
        // console.log("photos" + photos);
        if (photos) {
            // res.set('Content-Type', 'image/jpeg');
            return res.send(photos.photos);
        }
        else {
            return res.status(404).send('Image not found');
        }

    }
    catch (error) {
        res.status(301).send({
            success: false,
            message: 'error for photo details',
            error: error
        });
    }
}

//route for getting particular photo according to binary datas

// const getParticularPhoto = async (req, res) => {
//     try {
//         const { blob } = req.body;
//         console.log("arrived format", blob);
//         res.set('Content-Type', 'image/jpeg');
//         return res.send(blob);
//     }
//     catch (exception) {
//         res.status(501).send({
//             success: false,
//             messgae: 'problem for sending particulra photo',
//             error: exception.message
//         });
//     }
// }
const getParticularPhoto = async (req, res) => {
    try {
        const { identifier, id } = req.params;
        if (identifier == 0) {
            const photos = await productSchema.findById(id).select('photos');
            const data = photos.photos[identifier];
            res.set('Content-Type', 'image/jpeg');
            return res.send(data.data);
        }
        else if (identifier == 1) {
            const photos = await productSchema.findById(id).select('photos');
            const data = photos.photos[identifier];
            res.set('Content-Type', 'image/jpeg');
            return res.send(data.data);
        }
        else if (identifier == 2) {
            const photos = await productSchema.findById(id).select('photos');
            const data = photos.photos[identifier];
            res.set('Content-Type', 'image/jpeg');
            return res.send(data.data);
        }
        else if (identifier == 3) {
            const photos = await productSchema.findById(id).select('photos');
            const data = photos.photos[identifier];
            res.set('Content-Type', 'image/jpeg');
            return res.send(data.data);
        }

    }
    catch (exception) {
        res.status(501).send({
            success: false,
            messgae: 'problem for sending particulra photo',
            error: exception.message
        });
    }
}
//deletion controller
const deleteProduct = async (req, res) => {
    try {
        const { slug } = req.params;
        const query = await productSchema.deleteOne({ '_id': slug });
        if (query) {
            res.status(201).send({
                success: true,
                message: 'product deleted successfully'
            });
        }
        else {
            res.status(501).send({
                success: true,
                message: 'product not deleted successfully runtie error!'
            });
        }
    }
    catch (error) {
        res.status(404).send({
            succsees: false,
            message: 'error while deleting messages',
            error: error.message
        });
    }
}
//controller for updated route
const updateProduct = async (req, res) => {
    try {
        const { name, description, slug, price, category, quantity, shipping } = req.fields;
        const { filedata } = req.files;
        const filter = { _id: req.params.id };
        if (!name) {
            return res.status(400).json({ success: false, message: 'Name not provided' });
        }
        if (!description) {
            return res.status(400).json({ success: false, message: 'Description not provided' });
        }
        if (!quantity) {
            return res.status(400).json({ success: false, message: 'Quantity not provided' });
        }
        if (!category) {
            return res.status(400).json({ success: false, message: 'Category not provided' });
        }
        if (filedata && filedata.size > 1 * 1024 * 1024) {
            return res.status(400).json({ success: false, message: 'Photo size should be less than 1 MB' });
        }
        if (!shipping) {
            return res.status(400).json({ success: false, message: 'Shipping status not provided' });
        }




        const update = { name: name, description: description, slug: slugify(name), price: price, category: category, quantity: quantity, shipping: shipping };
        if (filedata) {
            update.photo = {
                data: fs.readFileSync(filedata.path),
                contentType: filedata.type
            };
        }
        let doc = await productSchema.findOneAndUpdate(filter, update, { new: true });
        if (doc) {
            res.status(201).send({
                succsee: true,
                message: 'product updated successfully'
            });
        }
        else {
            res.status(404).send({ success: false, message: 'error for updation' });
        }

    }

    catch (error) {
        res.status(501).send({
            succsee: false,
            message: 'error while updating product',
            error: error
        });
    }
}
//for getting count
const getCount = async (req, res) => {
    try {
        const count = await productSchema.find().count();
        if (count !== undefined) {
            res.status(200).send({
                total: count,
                success: true,
                message: 'Product count retrieved successfully'
            });
        } else {
            res.status(404).send({
                success: false,
                message: 'Product count not found'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Internal server error'
        });
    }
}

//filtering controllers
const filterProducts = async (req, res) => {
    try {
        const { checked, radio } = req.body;
        const args = {};
        if (checked.length > 0) args.category = checked;
        if (radio.length) args.price = { $gte: radio[0][0], $lte: radio[0][1] };
        const products = await productSchema.find(args).select(['-photo']).sort({ createdAt: -1 }).populate('category');;
        if (products) {
            res.status(200).send({
                total: products.length,
                success: true,
                message: 'filters applied successfully',
                data: { checked: checked, radio: radio },
                filtered: products
            });
        }

    }
    catch (error) {
        res.status(500).send({
            success: false,
            message: 'error for filtering',
            error: error
        });
    }
}
//send products as per page
const getProducts = async (req, res) => {
    try {
        const { page } = req.params;
        const products = await productSchema.find().select(['-photo']).sort({ createdAt: -1 }).populate('category').skip((page - 1) * 6).limit(6);

        if (products) {
            res.status(201).send({
                total: products.length,
                success: true,
                message: 'products getched as per categorywise',
                data: products
            });
        }
        else {
            res.status(501).send({
                succsee: false,
                message: 'product fetching problem as per pagewise'
            });
        }
    }
    catch (error) {
        res.status(501).send({
            success: false,
            message: 'error for getting categories page wise'
        });
    }
}

//controller for funding similar products as oer category
const similarProducts = async (req, res) => {
    try {
        const { pId } = req.params;

        // Find the product by ID, excluding the 'photo' field
        const product = await productSchema.findById(pId).select('-photo');

        if (product) {
            // Find similar products by category
            const similarProducts = await productSchema.find({ category: product.category }).select(['-photo']);

            if (similarProducts && similarProducts.length > 0) {
                return res.status(200).send({
                    total: similarProducts.length,
                    success: true,
                    message: 'Successfully found similar products',
                    data: similarProducts
                });
            } else {
                return res.status(404).send({
                    success: false,
                    message: 'Similar products not found'
                });
            }
        } else {
            return res.status(404).send({
                success: false,
                message: 'Product not found'
            });
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: 'Error getting similar products',
            error: error.message
        });
    }
};
//braintree cinteollers
//controller for generate client token id
const getClientToken = async (req, res) => {
    try {
        gateway.clientToken.generate({}, (err, response) => {
            if (err) {
                res.status(501).send(err);
            }
            else {
                res.send(response.clientToken);
            }

        })
    }
    catch (error) {
        res.status(500).send({
            succsees: false,
            message: 'Error getting client token'
        });
    }
}
//controller for transaction and making payment
const makePayment = async (req, res) => {
    try {
        //this is for receiving nonce as payment method from clinet service
        const nonceFromTheClient = req.body.payment_method_nonce;
        //making transaction based on nonce we havve and amount which will be provided by us
        gateway.transaction.sale(
            {
                amount: "5.00",
                paymentMethodNonce: nonceFromTheClient,
                options: {
                    submitForSettlement: true,
                },
            },
            function (err, result) {
                if (err) {
                    console.error(err);
                    return;
                }

                if (result.success) {
                    // console.log("Transaction ID: " + result.transaction.id);
                    res.status(201).send({
                        success: true,
                        messgae: 'transaction done successsfully',
                        data: result
                    });
                    return;
                } else {
                    res.status(501).send({
                        success: false,
                        messgae: 'error while performing transaction',
                        error: result.message
                    });
                    return;
                }
            }
        );
    }
    catch (error) {
        res.status(404).send({
            succsee: false,
            message: 'error while making transactions',
            error: error
        });
    }
}
//route for getSimilarProducts using array of product ids
const getSimilarAsPerCatIds = async (req, res) => {
    try {
        const catIds = req.body.catIds;
        // console.log("catids", catIds);
        const products = await productSchema.find({ category: catIds }).select(['-photo']);
        if (products) {
            return res.status(200).send({
                success: true,
                message: 'Successfully found similar products based on categories',
                data: products
            });
        }
        else {
            res.status(404).send({
                succsee: false,
                message: 'error while  finding similar products as per category',
            });
            return;
        }
    }
    catch (error) {
        res.status(404).send({
            succsee: false,
            message: 'error while  finding products',
            error: error
        });
    }
}
//search product using search bar controller
const searchThroughKeyword = async (req, res) => {
    try {
        const { keyword } = req.params;
        const products = await productSchema.find({ $or: [{ name: { $regex: keyword, $options: "i" } }, { description: { $regex: keyword, $options: "i" } }] }).select(['-photo']);
        if (products) {
            res.status(201).send({
                total: products.length,
                success: true,
                message: 'found products...',
                data: products
            });
        }
        else {
            res.status(401).send({
                success: false,
                message: 'error from api'
            });
        }
    }
    catch (error) {
        res.status(501).send({
            success: false,
            message: 'error for sending request',
            error: error.message
        });
    }
}
//stripe managers
const sessionManager = async (req, res) => {
    const { pName, price, pId, Uid, quantity } = req.query;
    // console.log("pName: " + pName, "price" + price, "pId: " + pId, "Uid: " + Uid);
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    // Provide the exact Price ID (for example, pr_1234) of the product you want to sell

                    price_data: {
                        currency: 'usd',
                        unit_amount: price,
                        product_data: {
                            name: pName,
                            metadata: {
                                pId: pId,
                                Uid: Uid // Include pId in metadata
                            },
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/success.html?sessionId={CHECKOUT_SESSION_ID}`,
            cancel_url: `${YOUR_DOMAIN}/cancel.html`,
        });
        // console.log(session);
        //here placing code for storing orders in orderSchema
        const orderGroupe = await orderSchema.findOne({ user: Uid });
        if (orderGroupe) {
            //means his group already created
            if (!orderGroupe.orders) {
                // console.log("field not found of as products");
            }
            // console.log("his previous session is present just appended products");
            orderGroupe.orders.push({ product: pId, quantity: quantity });//here quantity is sent so we have to minus that quantity prom actuaal product quantoties
            await orderGroupe.save();

            //task for minusing quantitiy that was sold to customer as an product
            const updateData = { $inc: { quantity: -quantity } };
            const updatedProduct = await productSchema.findByIdAndUpdate(pId, updateData, { new: true });//line updates quantitiy after oroduct sold to customer
        }
        else {
            //craete his ordderGoup and add her tarnsaction details in database
            // console.log("created new session for him");
            const order = new orderSchema({ transaction_id: session.id, products: [pId], user: Uid, price: price });
            await order.save();
            // console.log("payment details stored successfully");
        }
        //at this stage orders also stored i have just setup transactions here so furether status of transaction handiver by success.html
        const newTransaction = new transactionHistory({
            user: Uid,
            amount: price
        });
        await newTransaction.save();

        res.redirect(303, session.url);
    }
    catch (exception) {
        res.status(501).send({
            success: false,
            message: 'error while creating payment sessionn',
            error: exception.message
        });
    }
}
const getSessionDetails = async (req, res) => {
    try {
        const { sessionId } = req.params;
        // console.log("sessionId", sessionId);
        const session = await stripe.checkout.sessions.retrieve(
            sessionId
        );
        if (session) {

            res.status(201).send({
                success: true,
                message: 'session retrieved successfully',
                sessionDetails: session
            });
        }
        else {
            res.status(500).send({
                success: false,
                messgae: 'error form api for finding session details'
            });
        }
    }
    catch (exception) {
        res.status(501).send({
            success: false,
            message: 'problem for retrieve session',
            error: exception.message

        });
    }
}
module.exports = { getParticularPhoto, getSessionDetails, sessionManager, searchThroughKeyword, productController, getAllproducts, getSingleProduct, getPhoto, deleteProduct, updateProduct, filterProducts, getCount, getProducts, similarProducts, getClientToken, makePayment, getSimilarAsPerCatIds };