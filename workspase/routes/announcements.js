const express = require('express');
const app = express();
const Announcement = require('../models/announcement');
const Image = require('../models/image');
const check = require('../check');


const NodeGeocoder = require('node-geocoder');
 
const options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: 'AIzaSyBGFkD7-oYJBA-wvwwQW5Gx7gJQwRtD30I',
    formatter: null
};
 
const geocoder = NodeGeocoder(options);


//============================================================
//ANNOUNCEMENT ROUTES
//============================================================

//============================================================
//INDEX - SHOW ALL ANNOUNCEMENT
//============================================================
app.get("/announcements", (req, res) => {
    //GET ANNOUNCEMENTs DATA FROM DB
    Announcement.find({}).populate("image").exec((err, allAnnouncement) => {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found announcements");
            res.redirect('/');
        } else {
            //IF ALL IS OK, RENDER PAGE WITH THAT DATA
            //RENDER DATA
            res.render("announcements/index", {
                announcements: allAnnouncement,
                pagename: "Annoucements"
            });
        }
    });
});

//============================================================
//CREATE - ADD NEW ANNOUNCEMENT TO BD
//============================================================
app.post("/announcements", check.isLoggedIn, (req, res) => {
    //GET DATA FROM REQUEST 
    const name = req.body.name;
    const cost = req.body.cost;
    const description = req.body.description;
    const author = {
        id: req.user.id,
        username: req.user.username
    };
    
    const startStr = req.body.daterange.split(' - ')[0].split('/');
    const endStr = req.body.daterange.split(' - ')[1].split('/');
    const startDate = new Date(startStr[2],startStr[1]-1,startStr[0]);
    const endDate = new Date(endStr[2],endStr[1]-1,endStr[0]);

    geocoder.geocode(req.body.location, (err, map) => {
        if (err || !map.length) {
            console.log(err);
            req.flash('error', err.message);
            // req.flash('error', 'Invalid address');
            return res.redirect('back');
        } else {
            const lat = map[0].latitude;
            const lng = map[0].longitude;
            const location = map[0].formattedAddress;

            //GET IMAGE FILE AND EXTENSION OF IMAGE
            const fileImage = req.files.image;
            if(fileImage){
                const extension = fileImage.name.substr(
                    fileImage.name.lastIndexOf(".") + 1
                );
                //GET NAME OF IMAGE WITHOUT EXTENTION
                const sliceRange = (extension.length + 1) * -1;
                const imageName = fileImage.name.slice(0, sliceRange);

                //IF EXTENSION NOT .jpg, .jpeg OR .png DON'T ALOWE TO WRITE FILE
                if(extension === "png" || extension === "jpg" || extension === "jpeg") {

                    const newAnnouncement = {
                        name: name,
                        cost: cost,
                        description: description,
                        author: author,
                        startDate: startDate,
                        endDate: endDate,
                        lat: lat,
                        lng: lng,
                        location: location
                    };
                
                    //SAVE NEW OBJECT TO BD
                    Announcement.create(newAnnouncement, (err, announcement) => {
                        if (err) {
                            //IFF ERROR
                            console.log(err);
                            req.flash('error', "Have some problems with creating Your announcement. Please try again");
                            res.redirect('back');
                        } else {
                            //IF ALL IS OK, CREATE IMAGE
                            const newImage = {
                                imagename: announcement.id + '_' + imageName,
                                extension: extension
                            };
                            Image.create(newImage, (err, createdImage) => {
                                if (err) {
                                    //IFF ERROR
                                    req.flash('error', "Have some problems creating Your image. Please try again");
                                    res.redirect('back');
                                } else {
                                    // Use the mv() method to place the file somewhere on your server
                                    fileImage.mv(`./images/${announcement.id}_${imageName}.${extension}`, err => {
                                        if (err){
                                            req.flash('error', "Have some problems with wrinting Your image. Please try again");
                                            res.redirect('back');
                                        }else {
                                            //IF ALL IS OK, REDIRECT TO  PAGE WITH THAT DATA
                                            announcement.image = createdImage;
                                            announcement.save();
                                            req.flash('succes', "Successfully create announcement");
                                            res.redirect("/announcements/" + announcement.id);
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    //IMAGE EXTENSION FORMAT NOT ALOWED TO UPLOAD AS IMAGE
                    req.flash('error', "Image extension can be only .jpg, .jpeg or .png");
                    res.redirect('back');
                } 
            }
        }
    });
});

//============================================================
//NEW - SHOW FORM TO CREATE NEW ANNOUNCEMENT
//============================================================
app.get("/announcements/new", check.isLoggedIn, (req, res) => {
    res.render("announcements/new", {pagename: "Create new anouncement"});
});

//============================================================
//SHOW - SHOWS MORE INFO ABOUT A SPECIFIC ANNOUNCEMENT
//============================================================
app.get("/announcements/:id", (req, res) => {

    //FIND A ANNOUNCEMENT
    Announcement.findById(req.params.id).populate("comments").populate("author.id").populate("image").exec((err, foundedAnnouncement) => {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found announcement");
            res.redirect("/announcements")
        } else {

            //CHECK IF ANNOUNCEMENT WITH THAT ID EXIST
            if (!foundedAnnouncement) {
                req.flash("error", "Announcement not found.");
                return res.redirect("back");
            }

            //IF ALL IS OK, RENDER SHOW TEMPLATE WITH THAT ANNOUNCEMENT
            res.render("announcements/show", {
                announcement:foundedAnnouncement,
                pagename: `Allx Travel | ${foundedAnnouncement.name}`
            });
        }
    });
});

//============================================================
//EDIT - SHOW FORM TO EDIT EXISTING ANNOUNCEMENT
//============================================================
app.get("/announcements/:id/edit", check.checkPermitions, (req, res) => {
    Announcement.findById(req.params.id, (err, foundedAnnouncement) => {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found announcement");
            res.redirect('back');
        } else {

            //CHECK IF ANNOUNCEMENT WITH THAT ID EXIST
            if (!foundedAnnouncement) {
                req.flash("error", "Announcement not found.");
                return res.redirect("back");
            }

            //IF ALL IS OK, RENDER EDIT PAGE WITH ANNOUNCEMENT DATA
            res.render('announcements/edit', {
                announcement:foundedAnnouncement,
                pagename: "Edit anouncement"
            });
        }
    });
});

//============================================================
//UPDATE - UPDATE A SPECIFIC ANNOUNCEMENT
//============================================================
app.put("/announcements/:id/", check.checkPermitions, (req, res) => {
    geocoder.geocode(req.body.location, (err, data) => {
        if (err || !data.length) {
          req.flash('error', err.message);
        //   req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        const lat = data[0].latitude;
        const lng = data[0].longitude;
        const location = data[0].formattedAddress;
        const name = req.body.name;
        const cost = req.body.cost;
        const description = req.body.description;

        const startStr = req.body.daterange.split(' - ')[0].split('/');
        const endStr = req.body.daterange.split(' - ')[1].split('/');
        const startDate = new Date(startStr[2],startStr[1]-1,startStr[0]);
        const endDate = new Date(endStr[2],endStr[1]-1,endStr[0]);

        const updatedAnnouncement = {
            name: name,
            cost:cost,
            description: description,
            startDate: startDate,
            endDate: endDate,
            lat: lat,
            lng: lng,
            location:location
        };
        Announcement.findByIdAndUpdate(req.params.id, updatedAnnouncement, (err, announcement) => {
            if (err) {
                //IFF ERROR
                req.flash('error', "Cannot found announcement");
                res.redirect('back');
            } else {
                

                //UPDATE IMAGE FILE OR GO TO ANNOUNCEMENT

                //GET IMAGE AND CHECH IF IMAGE NOT EMPTY
                const fileImage = req.files.image;
                if(fileImage){
                    //GET EXTENSION OF IMAGE
                    const extension = fileImage.name.substr(
                        fileImage.name.lastIndexOf(".") + 1
                    );
                    
                    //GET NAME OF IMAGE WITHOUT EXTENTION
                    const sliceRange = (extension.length + 1) * -1;
                    const imageName = fileImage.name.slice(0, sliceRange);
                
                    //IF EXTENSION NOT .jpg, .jpeg OR .png DON'T ALOWE TO WRITE FILE
                    if(extension === "png" || extension === "jpg" || extension === "jpeg") {
                        //IF ALL IS OK, CREATE IMAGE
                        const newImage = {
                            imagename: announcement.id + '_' + imageName,
                            extension: extension
                        };
                        Image.create(newImage, (err, createdImage) => {
                            if (err) {
                                //IFF ERROR
                                req.flash('error', "Have some problems creating Your image. Please try again");
                                res.redirect('back');
                            } else {
                                // Use the mv() method to place the file somewhere on your server
                                fileImage.mv(`./images/${announcement.id}_${imageName}.${extension}`, err => {
                                    if (err){
                                        req.flash('error', "Have some problems with wrinting Your image. Please try again");
                                        res.redirect('back');
                                    }else {
                                        //IF ALL IS OK, REDIRECT TO  PAGE WITH THAT DATA
                                        announcement.image = createdImage;
                                        announcement.save();
                                    }
                                });
                            }
                        });
                    }
                    else {
                        //IMAGE EXTENSION FORMAT NOT ALOWED TO UPLOAD AS IMAGE
                        req.flash('error', "Image extension can be only .jpg, .jpeg or .png");
                        res.redirect('back');
                    } 
                }
                //IF ALL IS OK, REDIRECT TO SHOW ROUTE WITH ANNOUNCEMENT
                req.flash('succes', "Successfully update announcement");
                res.redirect('/announcements/' + announcement._id);
            }
        });
    });
});

//============================================================
//DESTROY - DELETE A SPECIFIC ANNOUNCEMENT
//============================================================
app.delete("/announcements/:id/", check.checkPermitions, (req, res) => {
    Announcement.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found announcement");
            res.redirect('back');
        } else {
            req.flash('succes', "Successfully delete announcement");
            res.redirect('/announcements');
        }
    });
});

module.exports = app;