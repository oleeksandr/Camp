const express = require('express');
const app = express();
const Announcement = require('../models/announcement');
const Comment = require('../models/comment');
const check = require('../check');

//============================================================
//COMMENT ROUTES
//============================================================

//============================================================
//NEW - SHOW FORM TO CREATE NEW COMMENT IF USER LOGGED IN
//============================================================
app.get("/announcements/:id/comments/new", function (req, res) {
    //FIND ANNOUNCEMENT BY ID
    Announcement.findById(req.params.id, function(err, announcement){
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found announcement");
            res.redirect('back');
        } else {
            
            //CHECK IF ANNOUNCEMENT WITH THAT ID EXIST
            if (!announcement) {
                req.flash("error", "Announcement not found.");
                return res.redirect("back");
            }
            
            //IF ALL IS OK, RENDER NEW TEMPLATE FOR ANNOUNCEMENT
            res.render("comments/new", {announcement:announcement});
        }
    });
});

//============================================================
//CREATE - ADD COMMENT TO ANNOUNCEMENT IF USER LOGGED IN
//============================================================
app.post("/announcements/:id/comments", function (req, res) {
    //FIND ANNOUNCEMENT BY ID
    Announcement.findById(req.params.id, function(err, announcement){
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found announcement");
            res.redirect('/announcements');
        } else {
            
            //CHECK IF ANNOUNCEMENT WITH THAT ID EXIST
            if (!announcement) {
                req.flash("error", "Announcement not found.");
                return res.redirect("back");
            }
            
            //IF ALL IS OK, CREATE COMMENT
            Comment.create(req.body.comment, function(err, comment){
                if (err) {
                    //IFF ERROR
                    req.flash('error', "Have some problems with creating Your comment. Please try again");
                    res.redirect('/announcements');
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
                    //IF ALL IS OK, ADD COMMENT TO THE ANNOUNCEMENT
                    announcement.comments.push(comment);
                    announcement.save();
                    req.flash('succes', "Successfully create comment");
                    res.redirect('/announcements/' + announcement._id);
                }
            });
        }
    });
});






//============================================================
//EDIT - SHOW FORM TO EDIT EXISTING COMMENT
//============================================================
app.get("/announcements/:id/comments/:comment_id/edit", check.checkCommentEditePermitions, function(req, res){
    Announcement.findById(req.params.id, function(err, foundedAnnouncement) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found announcement");
            res.redirect('/announcements/');
        } else {
            
            //CHECK IF ANNOUNCEMENT WITH THAT ID EXIST
            if (!foundedAnnouncement) {
                req.flash("error", "Announcement not found.");
                return res.redirect("back");
            }
            
            // console.log("WE GOT DATA ABOUT ANNOUNCEMENT WITH SOME ID FROM DB AND WILL CHECK FOR COMMENT");
            Comment.findById(req.params.comment_id, function(err, foundComment) {
                if (err) {
                    //IFF ERROR
                    // res.redirect('/announcements/' + req.params.id);
                    req.flash('error', "Cannot found comment");
                    res.redirect('back');
                } else {
            
                    //CHECK IF COMMENT WITH THAT ID EXIST
                    if (!foundComment) {
                        req.flash("error", "Announcement not found.");
                        return res.redirect("back");
                    }
                    
                    //IF ALL IS OK, RENDER EDIT PAGE WITH COMMENT DATA
                    res.render("comments/edit", {announcement:foundedAnnouncement, comment:foundComment});
                }
            });
        }
    });
});

//============================================================
//UPDATE - UPDATE A SPECIFIC COMMENT
//============================================================
app.put("/announcements/:id/comments/:comment_id/", check.checkCommentEditePermitions, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found comment");
            res.redirect('back');
        } else {
            //IF ALL IS OK, REDIRECT TO SHOW ROUTE WITH ANNOUNCEMENT
            req.flash('succes', "Successfully update comment");
            res.redirect('/announcements/' + req.params.id);
        }
    });
});

//============================================================
//DESTROY - DELETE A SPECIFIC COMMENT
//============================================================
app.delete("/announcements/:id/comments/:comment_id/", check.checkCommentDeletePermitions, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found comment");
            res.redirect('back');
        } else {
            //IF ALL IS OK, DELETE COMMENT
            req.flash('succes', "Successfully delete comment");
            res.redirect('/announcements/' +  req.params.id);
        }
    });
});

module.exports = app;
