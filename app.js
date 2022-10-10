const express = require('express')
const passport = require('passport')
const Instagram = require('passport-instagram')
const session = require('express-session')

const app = express()

app.use(passport.initialize());
app.use(session({ secret: 'zizo2636046', resave: true, saveUninitialized: true }));
app.use(passport.session());

const InstagramStrategy = Instagram.Strategy;
passport.serializeUser((user, done) => {done(null, user)})
passport.deserializeUser((user, done) => {done(null, user)})

const instaConfig = {
  clientID: "3381300128859409",
  clientSecret: "7c1bfb405b196166bda8bc867be3a8d6",
  callbackURL: "https://autmn-social-auth-api.herokuapp.com/users/auth/instagram/callback/",
  profileFields   : ['id','displayName','name','gender','picture.type(large)','email']
}
const instaInit = (accessToken, refreshToken, profile, done) => {
  return done(null,profile)
}

passport.use(new InstagramStrategy(instaConfig, instaInit))

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index.ejs')
})
app.get('/auth/instagram', passport.authenticate('instagram', { scope: ['user_profile'] }));

app.get(
  '/auth/instagram/callback',
  passport.authenticate('instagram', {
    successRedirect: '/profile',
    failureRedirect: '/login'
  })
);

app.get('/profile', async (req, res) => {
  console.log(req.profile)
  res.render('profile', req.profile)
})

app.listen(5500)