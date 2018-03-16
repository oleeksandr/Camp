var mongoose = require("mongoose");

//SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
    name: String,
    // image: String,
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image"
    },
    description: String,
    cost: Number,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
     ]
});

//CREATE NEW CAMPGROUND MODEL IN DB BY FOLOWING SCHEMA 
module.exports = mongoose.model("Campground", campgroundSchema);