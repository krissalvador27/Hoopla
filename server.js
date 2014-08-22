// server.js
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');
var MongoStore = require('connect-mongo')(session);

var conf = {
  db: {
    db: 'Hoopla',
    host: 'kahana.mongohq.com',
    port: 10032,  
    username: 'test',
    password: '123', 
    collection: 'session', 
  },
  secret: 'whatisallthishoopla'
}

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database
var db = mongoose.connection;

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
  secret  : conf.secret,
  cookie  : {
    maxAge  : null          
  },
  store   : new MongoStore({
    mongoose_connection: db
  })
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use("/public",express.static(__dirname + '/public'));

// routes ======================================================================
require('./app/routes.js')(app, passport, db, mongoose); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);