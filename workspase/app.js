const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const flash = require('connect-flash');

const moment = require('moment');
const fileUpload = require('express-fileupload');

const passport = require('passport');
const LocalStrategy = require('passport-local');

const methodOverride = require('method-override')

const Announcement = require("./models/announcement");
const Comment = require("./models/comment");
const User = require("./models/user");

// const clearDB = require("./clear");

//ROUTING
const announcementRoutes = require('./routes/announcements');
const commentRoutes = require('./routes/comments');
const authRoutes = require('./routes/auth');


//************************************************************
//APP SETUP
//************************************************************

//DB LOCATION
mongoose.connect("mongodb://localhost/allx_travel_db");

//BODY PARSER TO PARSE DATA FROM REQUEST
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/images"));

app.use(methodOverride('_method'));

//WAIT FOR FILE .EJS
app.set("view engine", "ejs");

//USED TO SHOW MESSAGES
app.use(flash());

app.use(fileUpload());

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
    res.locals.succes = req.flash('succes');
    res.locals.error = req.flash('error');
    res.locals.moment = moment;
    next();
});

//USE ROUTING FROM SEPERATE FILES
app.use(authRoutes);
app.use(announcementRoutes);
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
    console.log("Server Starded");
    console.log("Port 3005");
});
