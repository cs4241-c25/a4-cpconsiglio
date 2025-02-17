// server/config/passportConfig.js
const LocalStrategy = require('passport-local').Strategy;
const { ObjectId } = require('mongodb');

module.exports = function (passport, getDb) {
  // Tells Passport how to store user data in session
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Tells Passport how to retrieve user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const db = getDb();
      const user = await db.collection('users').findOne(
        { _id: new ObjectId(id) },
        { password: 0 } // exclude password
      );
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });

  // Set up Local Strategy (username + password)
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const db = getDb();
        const user = await db.collection('users').findOne({ username });

        if (!user) {
          return done(null, false, { message: 'Incorrect username' });
        }
        // NOTE: We are NOT hashing the password, just comparing raw text
        if (user.password !== password) {
          return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user); // success
      } catch (error) {
        return done(error);
      }
    })
  );
};
