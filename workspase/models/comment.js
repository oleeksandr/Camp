var mongoose = require("mongoose");

//SCHEMA SETUP
var commentSchema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    text: String,
    createdAt: { type: Date, default: Date.now }
});

//CREATE NEW COMMENT MODEL IN DB BY FOLOWING SCHEMA 
module.exports = mongoose.model("Comment", commentSchema);