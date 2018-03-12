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
            console.log("WE GOT DATA ABOUT CAMPGROUND WITH SOME ID FROM DB AND CAN ADD COMMENT:");
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
            console.log("WE GOT DATA ABOUT CAMPGROUND WITH SOME ID FROM DB AND TRYING TO ADD COMMENT");
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
//EDIT - SHOW FORM TO EDIT EXISTING COMMENT
//============================================================
app.get("/campgrounds/:id/comments/:comment_id/edit", checkCommentPermitions, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            //IFF ERROR
            console.log("SOMETHING WENT WRONG!");
            console.log(err);
            res.redirect('/campgrounds/');
        } else {
            console.log("WE GOT DATA ABOUT CAMPGROUND WITH SOME ID FROM DB AND WILL CHECK FOR COMMENT");
            Comment.findById(req.params.comment_id, function(err, foundComment) {
                if (err) {
                    //IFF ERROR
                    console.log("SOMETHING WENT WRONG!");
                    console.log(err);
                    // res.redirect('/campgrounds/' + req.params.id);
                    res.redirect('back');
                } else {
                    console.log("WE GOT DATA ABOUT CAMPGROUND AND COMMENT AND NOW READY TO RENDER EDIT PAGE:");
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
app.put("/campgrounds/:id/comments/:comment_id/", checkCommentPermitions, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            //IFF ERROR
            console.log("SOMETHING WENT WRONG!");
            console.log(err);
            res.redirect('back');
        } else {
            console.log("WE UPDATE DATA ABOUT COMMENT WITH SOME ID FROM DB:");
            //IF ALL IS OK, REDIRECT TO SHOW ROUTE WITH CAMPGROUND
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

//============================================================
//DESTROY - DELETE A SPECIFIC COMMENT
//============================================================
app.delete("/campgrounds/:id/comments/:comment_id/", checkCommentPermitions, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            //IFF ERROR
            console.log("SOMETHING WENT WRONG!");
            console.log(err);
            res.redirect('back');
        } else {
            console.log("WE DELETE DATA ABOUT CAMPGROUND WITH SOME ID FROM DB:");
            res.redirect('/campgrounds/' +  req.params.id);
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

function checkCommentPermitions(req, res, next){
    //USER NEED TO BE LOGGED IN
    if(req.isAuthenticated()){
        //IF USER NOT OWNER OF THIS COMMENT HE HAVE NO PERMITION TO EDIT OR DELDETE HIM
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err) {
                //IFF ERROR
                console.log("SOMETHING WENT WRONG!");
                console.log(err);
                res.redirect('back');
            } else {
                // IF USER LOGGED IN AND CREATED THIS CAMPGROUND DO WHAT YOU WANT TO DO
                if(foundComment.author.id && foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    // res.send('You do not create this campground');
                    res.redirect('back');
                }
            }
        });
    } else {
        // res.send('You are not logged in');
        res.redirect('back');
    }
}

module.exports = app;
