var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var campgrounds = [
    // {
    //     name: "Olek Base",
    //     image: "http://img1.sunset.timeinc.net/sites/default/files/styles/1000x1000/public/image/2016/10/main/hoodview-campground-0510.jpg?itok=B8Eb65Uf",
    //     description: "This is my ows campground, and here we have clear river, air and a lot trees! We are waiting for you!!! Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    //     },
    // {
    //     name: "AllX",
    //     image: "http://wafflefarm.com/wp-content/uploads/2016/12/WaffleFarmCampground_Sunset_ClubGroup-Camping-Slide.jpg",
    //     description: "This is trailer park campground. come and join us! Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    //     },
    // {
    //     name: "National Park",
    //     image: "http://travel.home.sndimg.com/content/dam/images/travel/fullrights/2016/01/14/national-park-camping/camping-glacier-national-park-camping.jpg.rend.hgtvcom.966.725.suffix/1491593018562.jpeg",
    //     description: "Here you can all what you can imagine. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    //     }
    ];

function clearDB() {

    // REMOVE ALL CAMPGROUNDS
    Campground.remove({}, function (err) {
        if (err) {
            console.log(err);
        } else {
            //ADD CAMPGROUNDS
            campgrounds.forEach(function (seed) {
                Campground.create(seed, function (err, campground) {
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
                        }, function (err, comment) {
                            if (err) {
                                console.log(err);
                            } else {
                                campground.comments.push(comment);
                                campground.save();
                            }
                        });
                    }
                });
            });
        }
    });
    
}
module.exports = clearDB;
