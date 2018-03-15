var express = require('express');
var app = express();
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var check = require('../check');

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
            req.flash('error', "Cannot found campground");
            res.redirect('back');
        } else {
            
            //CHECK IF CAMPGROUND WITH THAT ID EXIST
            if (!campground) {
                req.flash("error", "Campground not found.");
                return res.redirect("back");
            }
            
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
            req.flash('error', "Cannot found campground");
            res.redirect('/campgrounds');
        } else {
            
            //CHECK IF CAMPGROUND WITH THAT ID EXIST
            if (!campground) {
                req.flash("error", "Campground not found.");
                return res.redirect("back");
            }
            
            //IF ALL IS OK, CREATE COMMENT
            Comment.create(req.body.comment, function(err, comment){
                if (err) {
                    //IFF ERROR
                    req.flash('error', "Have some problems with creating Your comment. Please try again");
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
                    //IF ALL IS OK, ADD COMMENT TO THE CAMPGROUND
                    campground.comments.push(comment);
                    campground.save();
                    req.flash('succes', "Successfully create comment");
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});






//============================================================
//EDIT - SHOW FORM TO EDIT EXISTING COMMENT
//============================================================
app.get("/campgrounds/:id/comments/:comment_id/edit", check.checkCommentEditePermitions, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found campground");
            res.redirect('/campgrounds/');
        } else {
            
            //CHECK IF CAMPGROUND WITH THAT ID EXIST
            if (!foundCampground) {
                req.flash("error", "Campground not found.");
                return res.redirect("back");
            }
            
            // console.log("WE GOT DATA ABOUT CAMPGROUND WITH SOME ID FROM DB AND WILL CHECK FOR COMMENT");
            Comment.findById(req.params.comment_id, function(err, foundComment) {
                if (err) {
                    //IFF ERROR
                    // res.redirect('/campgrounds/' + req.params.id);
                    req.flash('error', "Cannot found comment");
                    res.redirect('back');
                } else {
            
                    //CHECK IF COMMENT WITH THAT ID EXIST
                    if (!foundComment) {
                        req.flash("error", "Campground not found.");
                        return res.redirect("back");
                    }
                    
                    //IF ALL IS OK, RENDER EDIT PAGE WITH COMMENT DATA
                    res.render("comments/edit", {campground:foundCampground, comment:foundComment});
                }
            });
        }
    });
});

//============================================================
//UPDATE - UPDATE A SPECIFIC COMMENT
//============================================================
app.put("/campgrounds/:id/comments/:comment_id/", check.checkCommentEditePermitions, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found comment");
            res.redirect('back');
        } else {
            //IF ALL IS OK, REDIRECT TO SHOW ROUTE WITH CAMPGROUND
            req.flash('succes', "Successfully update comment");
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

//============================================================
//DESTROY - DELETE A SPECIFIC COMMENT
//============================================================
app.delete("/campgrounds/:id/comments/:comment_id/", check.checkCommentDeletePermitions, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found comment");
            res.redirect('back');
        } else {
            //IF ALL IS OK, DELETE COMMENT
            req.flash('succes', "Successfully delete comment");
            res.redirect('/campgrounds/' +  req.params.id);
        }
    });
});

module.exports = app;
