const express = require('express');
const {getUserSession,createNewUserAfterGoogleAuth,checkPresentOrNot, updateUserProfile, controlEnteries, loginController, proctedAccess, forgotPasswordController } = require('../controller/authController');
const router = express.Router();
const { verifierJwt, userPreviladgeChk } = require('../middlewares/verifierMiddle');
const passport = require('../helpers/passportSetup');
var jwt = require('jsonwebtoken');
const userSchema = require('../models/userSchema');
//route for register
router.post('/register', controlEnteries);

// rout for login
router.post('/login', loginController);
//user type request validation
router.get('/verify', verifierJwt, userPreviladgeChk, proctedAccess);

//crating router for forgot password
router.post('/forgot', forgotPasswordController);

//private router for authenticating user before going to dashboard

router.post('/user-authentication', verifierJwt, (req, res) => {
   res.status(200).send({
      isValidObjectId: true
   });
});

router.put("/update-user/:userIdentifier", updateUserProfile);

//creating api for recognizing admin and redirecting it to its own admin ashboard
router.post('/admin-authentication', verifierJwt, userPreviladgeChk, (req, res) => {
   res.send({ isAdmin: true });
});
//for login requests
router.get('/auth/google', (req, res, next) => {
   console.log("Authenticating.....");
   passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});
//router fir check weather user is already present in database or not for oAuth 2.0 google sign in
router.post("/check-entry",checkPresentOrNot);
//route for creating entry for newly google logined user
router.post("/create-entry",createNewUserAfterGoogleAuth);
//return present session for newly loginned google authenticated user
router.post("/get-session",getUserSession);


router.get('/auth/google/callback',
   passport.authenticate('google', { failureRedirect: '/error' }),
   async function (req, res) {
      // Successful authentication, redirect success.
      //here we can save user in database as new user if email already exists update its profile picture abd abitgeer information
      var jwtFromAccess = jwt.sign({ "id": req.user.id }, `${process.env.jwt_secret_key}`);
      console.log("current jwt", jwtFromAccess);
      console.log("redirecting after google login.....", req.user);
      const tmail = req.user.emails[0].value;
      const filter = { email: tmail };
      const update = { token: jwtFromAccess };
      const doc = await userSchema.findOneAndUpdate(filter, update, {
         new: true
      });
      if (doc) {
         res.redirect(`http://localhost:3002/${tmail}`);
      }

   });

   router.get('/google-test',(req,res)=>{
     try{
        res.redirect("http://localhost:3000/api/v1/auth/auth/google");
        console.log("after",res.data);
     }
     catch(err){
        res.send(err.message);
     }
   });

module.exports = router;