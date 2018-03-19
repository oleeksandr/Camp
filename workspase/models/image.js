const mongoose = require("mongoose");

//SCHEMA SETUP
const imageSchema = new mongoose.Schema({
    imagename: String,
    extension: String
});

//CREATE NEW COMMENT MODEL IN DB BY FOLOWING SCHEMA 
module.exports = mongoose.model("Image", imageSchema);