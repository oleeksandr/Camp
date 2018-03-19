const express = require('express');
const app = express();
const passport = require('passport');
const User = require('../models/user');

//============================================================
//LANDING PAGE OF Allx travel
//============================================================
app.get("/", function (req, res) {
    res.render("landing");
});

//============================================================
//AUTH ROUTES
//============================================================

//============================================================
//INDEX - SHOW REGISTER FORM
//============================================================
app.get("/register", function(req, res){
    res.render("register");
});

//============================================================
//CREATE - IF SOMEONE SIGN UP ADD NEW USER TO DB
//============================================================
app.post('/register', function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if (err) {
            //IFF ERROR
            req.flash('error', err.message);
            return res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, function(){
                req.flash('success', "Succesfully created Your account and logded You in us " + req.body.username);
                res.redirect("/announcements");
            });
        }
    })
});

//============================================================
//INDEX - SHOW LOGIN FORM
//============================================================
app.get('/login', function(req, res){
    res.render('login');
});

//============================================================
//IF SOMEONE LOGIN
//============================================================
app.post('/login', passport.authenticate('local', {
    successRedirect: '/announcements',
    failureRedirect: '/login'
}), function(req, res){
});

//============================================================
//INDEX - LOGOUT
//============================================================
app.get('/logout', function(req, res){
    req.logout();
    req.flash('succes', "You was succesfuly Logged out")
    res.redirect("/announcements");
});

module.exports = app;