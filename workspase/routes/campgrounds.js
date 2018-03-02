var express = require('express');
var app = express();
var Campground = require('../models/campground');

//============================================================
//CAMPGROUND ROUTES
//============================================================

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
app.post("/campgrounds", isLoggedIn, function (req, res) {
    //GET DATA FROM REQUEST AND SAVE INTO OBJECT
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user.id,
        username: req.user.username
    }
    var newCapm = {
        name: name,
        image: image,
        description: description,
        author: author
    };
    console.log(author);

    //SAVE NEW OBJECT TO BD
    Campground.create(newCapm, function (err, campground) {
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
app.get("/campgrounds/new", isLoggedIn, function (req, res) {
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
//CHEK IF USER LOGGED IN
//============================================================
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

module.exports = app;