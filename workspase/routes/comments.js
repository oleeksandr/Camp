var express = require('express');
var app = express();
var Campground = require('../models/campground');
var Comment = require('../models/comment');

//============================================================
//COMMENT ROUTES
//============================================================

//============================================================
//NEW - SHOW FORM TO CREATE NEW COMMENT IF USER LOGGED IN
//============================================================
app.get("/campgrounds/:id/comments/new", function (req, res) {
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

//============================================================
//CREATE - ADD COMMENT TO CAMPGROUND IF USER LOGGED IN
//============================================================
app.post("/campgrounds/:id/comments", function (req, res) {
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
                    // if (req.user){
                        comment.author.id = req.user ? req.user._id : null;
                        comment.author.username = req.user ? req.user.username : req.body.comment.author;
                        comment.save();
                    // } else{
                        // comment.author.id = null;
                        // comment.author.username = req.body.comment.author;
                        // comment.save();
                    // }
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
//CHEK IF USER LOGGED IN
//============================================================
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

module.exports = app;
