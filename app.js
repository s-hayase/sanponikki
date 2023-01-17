var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');

// モデルの読み込み
const User = require('./models/user');
const Diary = require('./models/diary');

User.sync().then(async () => {
  Diary.belongsTo(User, {foreignKey: 'userId'});
  Diary.sync();
  // Content.belongsTo(Diary, {foreignKey: 'diaryId'});
  // Content.sync();
  // Step.belongsTo(Diary, {foreignKey: 'diaryId'});
  // Step.sync();
});


const TwitterStrategy = require('passport-twitter').Strategy;
const config = require('./config');

var app = express();
app.use(helmet());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new TwitterStrategy({
  consumerKey: config.twitter.consumerKey,
  consumerSecret: config.twitter.consumerSecret,
  callbackURL: config.twitter.callbackURL
},
function (accessToken, refreshToken, profile, done) {
  process.nextTick(async function () {
    await User.upsert({
      userId: profile.id,
      username: profile.displayName
    });
    User.sync();
    done(null, profile);
  });
}
));

app.use(session({ secret: 'e55be81b307c1c09', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const diariesRouter = require('./routes/diaries');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/diaries', diariesRouter);

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/login' }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
