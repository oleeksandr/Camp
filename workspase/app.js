var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var passport = require('passport');
var LocalStrategy = require('passport-local');

var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");

var seedDB = require("./seeds");

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



//DELETE ALL FROM DB
seedDB();

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

//************************************************************
//APP SETUP END
//************************************************************



//************************************************************
//APP
//************************************************************


//============================================================
//LANDING PAGE OF YELPCAMP
//============================================================
app.get("/", function (req, res) {
    res.render("landing");
});

//============================================================
//INDEX - SHOW ALL CAMPGROUNDS
//============================================================
app.get("/campgrounds", function (req, res) {
    //GET CAMPGROUNDS DATA FROM DB
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            //IFF ERROR
            console.log("SOMETHING WENT WRONG!");
            console.log(err);
        } else {
            //IF ALL IS OK, RENDER PAGE WITH THAT DATA
            console.log("WE GOT DATA FROM DB:");
            //RENDER DATA
            res.render("campgrounds/index", {
                campgrounds: allCampgrounds
            });
        }
    });
});

//============================================================
//CREATE - ADD NEW CAMPGROUND TO BD
//============================================================
app.post("/campgrounds", function (req, res) {
    //GET DATA FROM REQUEST AND SAVE INTO OBJECT
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCapm = {
        name: name,
        image: image,
        description: description
    };

    //SAVE NEW OBJECT TO BD
    Campground.create(newCapm, function (err, newlyCamp) {
        if (err) {
            //IFF ERROR
            console.log("SOMETHING WENT WRONG!");
            console.log(err);
        } else {
            console.log("WE SAVE CAMP TO DB:");
            //IF ALL IS OK, REDIRECT TO PAGE
            res.redirect("/campgrounds");
        }
    });
});

//============================================================
//NEW - SHOW FORM TO CREATE NEW CAMPGROUND
//============================================================
app.get("/campgrounds/new", function (req, res) {
    res.render("campgrounds/new");
});

//============================================================
//SHOW - SHOWS MORE INFO ABOUT ONE CAMPGROUND
//============================================================
app.get("/campgrounds/:id", function (req, res) {

    //FIND A CAMPGROUND
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            //IFF ERROR
            console.log("SOMETHING WENT WRONG!");
            console.log(err);
        } else {
            console.log("WE GOT DATA ABOUT CAMPGROUND WITH SOME ID FROM DB:");
            //IF ALL IS OK, RENDER SHOW TEMPLATE WITH THAT CAMPGROUND
            res.render("campgrounds/show", {campground:foundCampground});
        }
    })
});






//============================================================
//COMMENT ROUTES
//============================================================
app.get("/campgrounds/:id/comments/new", isLoggedIn, function (req, res) {
    //FIND CAMPGROUND BY ID
    Campground.findById(req.params.id, function(err, campground){
        if (err) {
            //IFF ERROR
            console.log("SOMETHING WENT WRONG!");
            console.log(err);
        } else {
            console.log("WE GOT DATA ABOUT CAMPGROUND WITH SOME ID FROM DB:");
            //IF ALL IS OK, RENDER NEW TEMPLATE FOR CAMPGROUND
            res.render("comments/new", {campground:campground});
        }
    });
});

app.post("/campgrounds/:id/comments", isLoggedIn, function (req, res) {
    //FIND CAMPGROUND BY ID
    Campground.findById(req.params.id, function(err, campground){
        if (err) {
            //IFF ERROR
            console.log("SOMETHING WENT WRONG!");
            console.log(err);
            res.redirect('/campgrounds');
        } else {
            console.log("WE GOT DATA ABOUT CAMPGROUND WITH SOME ID FROM DB:");
            //IF ALL IS OK, CREATE COMMENT
            Comment.create(req.body.comment, function(err, comment){
                if (err) {
                    //IFF ERROR
                    console.log("SOMETHING WENT WRONG!");
                    console.log(err);
                    res.redirect('/campgrounds');
                } else {
                    console.log("WE CREATE A COMMENT");
                    //IF ALL IS OK, ADD COMMENT TO THE CAMPGROUND
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});



//============================================================
//AUTH ROUTES
//============================================================

//SHOW REGISTER FORM
app.get("/register", function(req, res){
    res.render("register");
});

//HANDLE IF SOMEONE SIGN UP
app.post('/register', function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if (err) {
            //IFF ERROR
            console.log("SOMETHING WENT WRONG!");
            console.log(err);
            return res.render('register');
        } else {
            passport.authenticate('local')(req, res, function(){
                res.redirect("/campgrounds");
            });
        }
    })
});

//SHOW LOGIN FORM
app.get('/login', function(req, res){
    res.render('login');
});

//HANDLE IF SOMEONE LOGIN
app.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
}), function(req, res){
});

//LOGOUT
app.get('/logout', function(req, res){
    req.logout();
    res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}


//============================================================
//WAIT FOR CONECTION TO THE SERWER
//============================================================
app.listen(3005, function () {
    console.log("Camp Server Starded");
    console.log("Port 3005");
});
