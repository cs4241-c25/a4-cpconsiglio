// server/config/passportConfig.js
const LocalStrategy = require('passport-local').Strategy;
const { ObjectId } = require('mongodb');

module.exports = function (passport, getDb) {
  // Passport needs to know how to handle user serialization/deserialization
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const db = getDb();
      const user = await db.collection('users').findOne({ _id: new ObjectId(id) }, { password: 0 });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Configure local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // find user in DB
      try {
        const db = getDb();
        const user = await db.collection('users').findOne({ username });
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        // NOT using hashed passwords (as requested), so just compare raw text
        if (user.password !== password) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        // success
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
};
