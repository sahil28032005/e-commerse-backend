const passport = require('passport');

passport.serializeUser(function (user, cb) {
  console.log("serialized....");
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

module.exports = passport;