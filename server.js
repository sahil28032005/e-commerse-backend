const express = require('express')
const app = express()
const port = 3000
const db = require('./config/db');
const cors = require('cors');
const conDb = require('./config/db');
const routes = require('./routes/userAuthentication.js');
const categoryroute = require('./routes/categoryRoutes.js');
const productsroute = require('./routes/productRoutes.js');
const cartRoutes = require('./routes/cartRoute.js');
const transactionRoutes = require('./routes/transactionRoute.js');
const ordersRoute = require('./routes/orderRoutes.js');
const formidableMiddleware = require('express-formidable');
const bodyParser = require('body-parser');
const connectToclouDinary =require('./config/cloudinaryConnection.js');
var jwt = require('jsonwebtoken');


var userProfile;

//google oAuth code here
const session = require('express-session');
const passport = require('./helpers/passportSetup.js');
const userSchema = require('./models/userSchema.js');
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// const GOOGLE_CLIENT_ID = '';
// const GOOGLE_CLIENT_SECRET = '';
conDb();
connectToclouDinary();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

app.use(express.static('public'));
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World!')
})

//authebticator middleware
// app.use(session({
//   resave: false,
//   saveUninitialized: true,
//   secret: 'SECRET',
//   cookie: { secure: false }
// }));
// //passport middlewares that app must follow
// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(new GoogleStrategy({
//   clientID: GOOGLE_CLIENT_ID,
//   clientSecret: GOOGLE_CLIENT_SECRET,
//   callbackURL: "http://localhost:3000/api/v1/auth/auth/google/callback"
// },
//   async function (accessToken, refreshToken, profile, done) {
//     console.log("in stage where wwe have all profile data with access token");
//     userProfile = profile;
//     console.log("accesstoken",accessToken);
//     // console.log("userProfile: " , userProfile);
//     // console.log("email registered with account",userProfile.emails[0].value);
//     //her check for exisitingn usee and register user

//     //doing by folloing certain steps
//     //1)convert access token to jsom web token
//     try {
//       // var jwtFromAccess = jwt.sign({ "id": accessToken }, `${process.env.jwt_secret_key}`);
//       //2)at this stage we got ourr jwt key that can be sent through needed places now forst check for existing user
//       let user = await userSchema.findOne({ email: userProfile.emails[0].value });
//       if (!user) {
//         let user = new userSchema({

//           email: userProfile.emails[0].value,
//           name: userProfile.displayName,
//           photo: profile.photos[0].value
//         });
//         await user.save();
//         console.log("user created successfully");
//       }
//       else {
//         console.log("user already exists with this email");
//       }
//       return done(null, userProfile);
//     }
//     catch (err) {
//      console.log(err.message);
//     }

//   }
// ));

//middlewares
app.use('/api/v1/auth', routes);
app.use('/api/v1/category', categoryroute);
app.use('/api/v1/products', productsroute);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', ordersRoute);
app.use('/api/v1/transactions', transactionRoutes);
app.use(formidableMiddleware());



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})