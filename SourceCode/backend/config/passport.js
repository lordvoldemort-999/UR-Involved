const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy; 
const bcrypt = require("bcrypt"); 
const User = require("../../database/models/User"); 

passport.use(
  new LocalStrategy( 
    {
      usernameField: "email", 
      passwordField: "password"
    },
    async (email, password, done) => {  
      try {
        const user = await User.findOne({ email: email.toLowerCase() }); 

        if (!user) {
          return done(null, false, { message: "No account found with that email." }); 
        }

        const passwordMatches = await bcrypt.compare(password, user.password); 

        if (!passwordMatches) {
          return done(null, false, { message: "Incorrect password." }); 
        }

        return done(null, user); 
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => { 

  done(null, user.id);
});

passport.deserializeUser(async (id, done) => { 
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;