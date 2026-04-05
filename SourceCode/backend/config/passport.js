//passport configuration file for user authentication using passport-local strategy
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy; //method Passport uses to authenticate users. In this case, we are using the local strategy which means we will be authenticating users based on a username and password stored in our database
const bcrypt = require("bcrypt"); //bcrypt is used for password hashing
const User = require("../../database/models/User"); //User model is what Passport uses to search the database for a user.

passport.use(
  new LocalStrategy( //Tells Passport to use this Local Strategy for authentication
    {
      usernameField: "email", //by default, LocalStrategy expects a username and password field
      passwordField: "password"
    },
    async (email, password, done) => {  //this is the function that will be called when a user tries to log in. It receives the email and password from the login form, and a done callback that we call when we are finished authenticating the user.
      try {
        const user = await User.findOne({ email: email.toLowerCase() }); //we search the database for a user with the provided email. We convert the email to lowercase to ensure that the search is case-insensitive.

        if (!user) {
          return done(null, false, { message: "No account found with that email." }); //if no user is found, we call done with null for the error, false for the user, and a message indicating that no account was found.
        }

        const passwordMatches = await bcrypt.compare(password, user.password); //if a user is found, we use bcrypt to compare the provided password with the hashed password stored in the database. bcrypt.compare returns true if the passwords match, and false otherwise.

        if (!passwordMatches) {
          return done(null, false, { message: "Incorrect password." }); //if the passwords do not match, we call done with null for the error, false for the user, and a message indicating that the password is incorrect.
        }

        return done(null, user); //if the passwords match, we call done with null for the error and the user object. This indicates that authentication was successful and Passport will now serialize the user information into the session.
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => { //serializeUser is a Passport method that determines which data of the user object should be stored in the session. In this case, we are storing the user's id in the session. 
// When subsequent requests are made, Passport will use this id to retrieve the full user object from the database.
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => { //deserializeUser is a Passport method that is called on every request that contains a serialized user in the session. It receives the id that we serialized in serializeUser, and a done callback. 
// We use the id to find the user in the database and return the full user object.
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;