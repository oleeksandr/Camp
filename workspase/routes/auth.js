const express = require('express');
const app = express();
const passport = require('passport');
const User = require('../models/user');

//============================================================
//LANDING PAGE OF Allx travel
//============================================================
app.get("/", (req, res) => {
    res.render("landing", {pagename: "Allx Travel"});
});

//============================================================
//AUTH ROUTES
//============================================================

//============================================================
//INDEX - SHOW REGISTER FORM
//============================================================
app.get("/register", (req, res) => {
    res.render("register", {pagename: "Register"});
});

//============================================================
//CREATE - IF SOMEONE SIGN UP ADD NEW USER TO DB
//============================================================
app.post('/register', (req, res) => {
    newUser = {
        email: req.body.email,
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
    }
    User.register(new User(newUser), req.body.password, (err, user) => {
        console.log(user);
        if (err) {
            //IFF ERROR
            req.flash('error', err.message);
            return res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, () => {
                req.flash('success', "Succesfully created Your account and logded You in us " + req.body.username);
                res.redirect("/announcements");
            });
        }
    })
});

//============================================================
//INDEX - SHOW LOGIN FORM
//============================================================
app.get('/login', (req, res) => {
    res.render('login', {pagename: "Login"});
});

//============================================================
//IF SOMEONE LOGIN
//============================================================
app.post('/login', passport.authenticate('local', {
    successRedirect: '/announcements',
    failureRedirect: '/login'
}), (req, res) => {

});

//============================================================
//INDEX - LOGOUT
//============================================================
app.get('/logout', (req, res) => {
    req.logout();
    req.flash('succes', "You was succesfuly Logged out")
    res.redirect("/announcements");
});

module.exports = app;