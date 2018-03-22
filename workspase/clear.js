const mongoose = require("mongoose");
const Announcement = require("./models/announcement");
const Comment = require("./models/comment");

const announcements = [
    //USE THIS FOR ADD ANNOUNCEMENTS AFTER CLEANING DB
    ];

function clearDB() {

    // REMOVE ALL CAMPGROUNDS
    Announcement.remove({}, (err) => {
        if (err) {
            console.log(err);
        } else {
            Comment.remove({}, (err) => {
                if (err) {
                    console.log(err);
                } else {

                    //ADD CAMPGROUNDS
                    announcements.forEach((seed) => {
                        Announcement.create(seed, (err, announcement) => {
                            if (err) {
                                console.log(err);
                            } else {
                                //ADD COMENTS
                                Comment.create({
                                    text: "This place is great",
                                    // author: "Bob"
                                    author: {
                                        id: null,
                                        username: "Bob"
                                    }
                                }, (err, comment) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        announcement.comments.push(comment);
                                        announcement.save();
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }
    }); 
}
module.exports = clearDB;
