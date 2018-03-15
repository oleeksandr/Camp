var express = require('express');
var app = express();
var Campground = require('../models/campground');
var check = require('../check');

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
            req.flash('error', "Cannot found campgrounds");
            res.redirect('/');
        } else {
            //IF ALL IS OK, RENDER PAGE WITH THAT DATA
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
app.post("/campgrounds", check.isLoggedIn, function (req, res) {
    //GET DATA FROM REQUEST AND SAVE INTO OBJECT
    var name = req.body.name;
    var image = req.body.image;
    var cost = req.body.cost;
    var description = req.body.description;
    var author = {
        id: req.user.id,
        username: req.user.username
    }
    var newCapm = {
        name: name,
        image: image,
        cost:cost,
        description: description,
        author: author
    };

    //SAVE NEW OBJECT TO BD
    Campground.create(newCapm, function (err, campground) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Have some problems with creating Your comment. Please try again");
            res.redirect('back');
        } else {
            //IF ALL IS OK, REDIRECT TO PAGE
            req.flash('succes', "Successfully create campground");
            res.redirect("/campgrounds");
        }
    });
});

//============================================================
//NEW - SHOW FORM TO CREATE NEW CAMPGROUND
//============================================================
app.get("/campgrounds/new", check.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

//============================================================
//SHOW - SHOWS MORE INFO ABOUT A SPECIFIC CAMPGROUND
//============================================================
app.get("/campgrounds/:id", function (req, res) {

    //FIND A CAMPGROUND
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found campground");
            res.redirect("back")
        } else {

            //CHECK IF CAMPGROUND WITH THAT ID EXIST
            if (!foundCampground) {
                req.flash("error", "Campground not found.");
                return res.redirect("back");
            }

            //IF ALL IS OK, RENDER SHOW TEMPLATE WITH THAT CAMPGROUND
            res.render("campgrounds/show", {campground:foundCampground});
        }
    });
});

//============================================================
//EDIT - SHOW FORM TO EDIT EXISTING CAMPGROUND
//============================================================
app.get("/campgrounds/:id/edit", check.checkPermitions, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found campground");
            res.redirect('back');
        } else {

                //CHECK IF CAMPGROUND WITH THAT ID EXIST
                if (!foundCampground) {
                    req.flash("error", "Campground not found.");
                    return res.redirect("back");
                }
                
                console.log("WE GOT DATA ABOUT CAMPGROUND WITH SOME ID FROM DB AND RENDER EDIT PAGE:");
                //IF ALL IS OK, RENDER EDIT PAGE WITH CAMPGROUND DATA
                res.render('campgrounds/edit', {campground:foundCampground});
        }
    });
});

//============================================================
//UPDATE - UPDATE A SPECIFIC CAMPGROUND
//============================================================
app.put("/campgrounds/:id/", check.checkPermitions, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found campground");
            res.redirect('back');
        } else {           
            //IF ALL IS OK, REDIRECT TO SHOW ROUTE WITH CAMPGROUND
            req.flash('succes', "Successfully update campground");
            res.redirect('/campgrounds/' + updatedCampground._id);
        }
    });
});

//============================================================
//DESTROY - DELETE A SPECIFIC CAMPGROUND
//============================================================
app.delete("/campgrounds/:id/", check.checkPermitions, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found campground");
            res.redirect('back');
        } else {
            req.flash('succes', "Successfully delete campground");
            res.redirect('/campgrounds');
        }
    });
});

module.exports = app;