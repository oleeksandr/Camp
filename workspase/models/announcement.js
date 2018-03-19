const mongoose = require("mongoose");

//SCHEMA SETUP
const announcementSchema = new mongoose.Schema({
    name: String,
    // image: String,
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image"
    },
    description: String,
    location: String,
    lat: Number,
    lng: Number,
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

//CREATE NEW ANNOUNCEMENT MODEL IN DB BY FOLOWING SCHEMA 
module.exports = mongoose.model("Announcement", announcementSchema);