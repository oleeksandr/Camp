const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

//SCHEMA SETUP
const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    firstName: String,
    lastName: String,
    phone: Number,
    password: String
});

userSchema.plugin(passportLocalMongoose);

//CREATE NEW USER MODEL IN DB BY FOLOWING SCHEMA 
module.exports = mongoose.model("User", userSchema);