const jwt = require('jsonwebtoken');
const userSchema = require('../models/userSchema');
const { exists } = require('../models/categorySchema');
const verifierJwt = async (req, res, next) => {
    try {
        // console.log(req.headers.authorization);
        const decode = jwt.verify(req.headers.authorization, process.env.jwt_secret_key);
        if (decode) {
            // res.status(301).send({
            //     success: 'true', message: 'verfied successfully'
            // });
            req.user = decode;
        }
        else{
            connsole.log("jwt verifier error");
            res.status(302).send({
                success: 'false', message: 'verfied not successfully thorugh jwt'
            });
        }
       

        next();//important to transfer contorl over next middleware function otherwise it stops here
    }
    catch (exception) {
        res.status(444).send({ success: 'false', messsage: 'error while verification', exception });
    }


}
const userPreviladgeChk = async (req, res, next) => {

    try {
        const { userId } = req.body;
        // console.log(userId);
        const user = await userSchema.findOne({ _id: userId });
        if (!user) {
            res.status(301).send({ success: 'false', messsage: 'error while finding user' });
            return;
        }
        if (user && user.role == 1) {
            //here means its normal user
            // console.log("this user is admin having role as 1");
            // res.status(200).send({ success: 'true', messsage: 'successfully identified role of user' });
            next();
        }
        else {
            //means admin level user having high priority
            // console.log(`this is normal user having name ${user.name}`);
            res.status(600).send({
                success:false,
                message:"not an admin try using admin level prevelidges...."
            });
        }
    }
    catch (exception) {
        console.log(exception);
        res.status(501).send({ success: 'false', message: 'error while checking previledge level' });
    }
}
module.exports = { verifierJwt, userPreviladgeChk };