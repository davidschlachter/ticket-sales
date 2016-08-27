var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');

var app = express();

// Connect to the database
mongoose.connect(config.opt.db, config.opt.mongoose);
var db = mongoose.connection;
db.on('error', function (err) {
  console.log('Connection error to MongoDB database ', err);
});
db.once('open', function () {
  console.log('Connected to the MongoDB database.');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser(config.opt.sessionsecret));
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1);
app.use(session({
  proxy: true,
  secret: config.opt.sessionsecret,
  cookie: {
    secure: true,
    httpOnly: true,
    path: '/'
  },
  store: new MongoStore({
    mongooseConnection: db,
    touchAfter: 8 * 3600 // Don't update session entry more than once in 8 hrs
  }),
  resave: false, // Don't save session if unmodified
  saveUninitialized: false // Don't create session until something stored
}));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;