var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var passport = require('passport');
var LocalStrategy = require('passport-local');

var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");

var clearDB = require("./clear");

//ROUTING
var campgroundRoutes = require('./routes/campgrounds');
var commentRoutes = require('./routes/comments');
var authRoutes = require('./routes/auth');


//************************************************************
//APP SETUP
//************************************************************

//DB LOCATION
mongoose.connect("mongodb://localhost/yelp_camp");

//BODY PARSER TO PARSE DATA FROM REQUEST
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(__dirname + "/public"));

//WAIT FOR FILE .EJS
app.set("view engine", "ejs");

//DELETE ALL FROM DB AND ADD SOME TEST DATA
// clearDB();

//PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: "string to decode and encode code",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//ADD TO EACH ROUTES INFORMATION ABOUT USER TO "loggedInUser"
app.use(function(req, res, next){
    res.locals.loggedInUser = req.user;
    next();
});

//USE ROUTING FROM SEPERATE FILES
app.use(authRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);

//************************************************************
//APP SETUP END
//************************************************************



//************************************************************
//APP
//************************************************************

//ALL ROUTINGS IS IN ROUTES FOLDER

//============================================================
//WAIT FOR CONECTION TO THE SERWER
//============================================================
app.listen(3005, function () {
    console.log("Camp Server Starded");
    console.log("Port 3005");
});
