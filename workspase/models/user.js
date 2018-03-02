var mongoose = require("mongoose");
var passportLocalMongoose = require('passport-local-mongoose');

//SCHEMA SETUP
var userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

//CREATE NEW USER MODEL IN DB BY FOLOWING SCHEMA 
module.exports = mongoose.model("User", userSchema);