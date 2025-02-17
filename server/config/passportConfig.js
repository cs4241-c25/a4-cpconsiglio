// server/config/passportConfig.js
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { ObjectId } = require('mongodb');

module.exports = function (passport, getDb) {
  // Serialize user into session
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const db = getDb();
      const user = await db.collection('users').findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } } // exclude password field
      );
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });

  // Configure Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const db = getDb();
        const user = await db.collection('users').findOne({ username });
        if (!user) {
          return done(null, false, { message: 'Incorrect username' });
        }
        // Comparing raw text (not hashed) as per current setup
        if (user.password !== password) {
          return done(null, false, { message: 'Incorrect password' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Configure GitHub Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const db = getDb();
          // Check if user already exists using GitHub ID
          let user = await db.collection('users').findOne({ githubId: profile.id });
          if (user) {
            return done(null, user);
          }
          // Otherwise, create a new user record
          const newUser = {
            username: profile.username,
            githubId: profile.id,
            displayName: profile.displayName,
            // You can include additional profile info as needed
          };
          const result = await db.collection('users').insertOne(newUser);
          newUser._id = result.insertedId;
          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
