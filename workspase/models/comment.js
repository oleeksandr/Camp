var mongoose = require("mongoose");

//SCHEMA SETUP
var commentSchema = new mongoose.Schema({
    text: String,
    author: String
});

//CREATE NEW COMMENT MODEL IN DB BY FOLOWING SCHEMA 
module.exports = mongoose.model("Comment", commentSchema);