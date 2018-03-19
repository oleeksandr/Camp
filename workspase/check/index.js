//REQUIRE
const Announcement = require('../models/announcement');
const Comment = require('../models/comment');

//ALL MIDDLEWARES
const checkFunctions = {

    //============================================================
    //CHEK IF USER LOGGED IN
    //============================================================
    isLoggedIn: function (req, res, next){
        if (req.isAuthenticated()){
            return next();
        }
        req.flash('error', "You need to Login first");
        res.redirect('/login');
    },

    //============================================================
    //CHEK IF USER LOGGED IN AND HAVE PERMITIONS TO EDIT OR DELETE ANNOUNCEMENT
    //============================================================
    checkPermitions: function(req, res, next){
        //USER NEED TO BE LOGGED IN
        if(req.isAuthenticated()){
            //IF USER NOT OWNER OF THIS ANNOUNCEMENT HE HAVE NO PERMITION TO EDIT HIM
            Announcement.findById(req.params.id, function (err, foundedAnnouncement) {
                if (err) {
                    //IFF ERROR
                    req.flash('error', "Cannot found announcement, with You are try to access");
                    res.redirect('/announcements/');
                } else {
            
                    //CHECK IF ANNOUNCEMENT WITH THAT ID EXIST
                    if (!foundedAnnouncement) {
                        req.flash("error", "Announcement not found.");
                        return res.redirect("back");
                    }

                    // IF USER LOGGED IN AND CREATED THIS ANNOUNCEMENT DO WHAT YOU WANT TO DO
                    if(foundedAnnouncement.author.id.equals(req.user._id)){
                        next();
                    } else {
                        req.flash('error', "You don't have permissions. You are not the owner of this announcement");
                        res.redirect('back');
                    }
                }
            });
        } else {
            req.flash('error', "You are not Logged in, You need to Login first");
            res.redirect('back');
        }
    },

    //============================================================
    //CHEK IF USER LOGGED IN AND HAVE PERMITIONS TO EDIT OR DELETE COMMENT
    //============================================================
    checkCommentEditePermitions: function (req, res, next){
        //USER NEED TO BE LOGGED IN
        if(req.isAuthenticated()){
            //IF USER NOT OWNER OF THIS COMMENT HE HAVE NO PERMITION TO EDIT OR DELDETE HIM
            Comment.findById(req.params.comment_id, function(err, foundComment) {
                if (err) {
                    //IFF ERROR
                    req.flash('error', "Cannot found comment, with You are try to access");
                    res.redirect('back');
                } else {
            
                    //CHECK IF ANNOUNCEMENT WITH THAT ID EXIST
                    if (!foundComment) {
                        req.flash("error", "Announcement not found.");
                        return res.redirect("back");
                    }
            
                    // IF USER LOGGED IN AND CREATED THIS COMMENT DO WHAT YOU WANT TO DO
                    if(foundComment.author.id && foundComment.author.id.equals(req.user._id)){
                        next();
                    } else {
                        req.flash('error', "You don't have permissions. You are not the owner of this comment or announcement");
                        res.redirect('back');
                    }
                }
            });
        } else {
            req.flash('error', "You are not Logged in, You need to Login first");
            res.redirect('back');
        }
    },

        //============================================================
    //CHEK IF USER LOGGED IN AND HAVE PERMITIONS TO DELETE COMMENT
    //============================================================
    checkCommentDeletePermitions: function (req, res, next){
        //USER NEED TO BE LOGGED IN
        if(req.isAuthenticated()){
            //IF USER NOT OWNER OF THIS COMMENT OR OF THIS ANNOUNCEMENT HE HAVE NO PERMITION TO EDIT OR DELDETE HIM

            Announcement.findById(req.params.id, function (err, foundedAnnouncement) {
                if (err) {
                    //IFF ERROR
                    req.flash('error', "Cannot found announcement, with You are try to access");
                    res.redirect('/announcements/');
                } else {
            
                    //CHECK IF ANNOUNCEMENT WITH THAT ID EXIST
                    if (!foundedAnnouncement) {
                        req.flash("error", "Announcement not found.");
                        return res.redirect("back");
                    }

                    Comment.findById(req.params.comment_id, function(err, foundComment) {
                        if (err) {
                            //IFF ERROR
                            req.flash('error', "Cannot found comment, with You are try to access");
                            res.redirect('back');
                        } else {
                    
                            //CHECK IF ANNOUNCEMENT WITH THAT ID EXIST
                            if (!foundComment) {
                                req.flash("error", "Announcement not found.");
                                return res.redirect("back");
                            }

                            // IF USER LOGGED IN AND CREATED THIS COMMENT DO WHAT YOU WANT TO DO
                            if(foundComment.author.id && foundComment.author.id.equals(req.user._id) || foundedAnnouncement.author.id && foundedAnnouncement.author.id.equals(req.user._id)){
                                next();
                            } else {
                                req.flash('error', "You don't have permissions. You are not the owner of this comment or announcement");
                                res.redirect('back');
                            }
                        }
                    });
                }
            });
        } else {
            req.flash('error', "You are not Logged in, You need to Login first");
            res.redirect('back');
        }
    }

}
module.exports = checkFunctions;