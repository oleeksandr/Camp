const express = require('express');
const app = express();
const Campground = require('../models/campground');
const Image = require('../models/image');
const check = require('../check');

//============================================================
//CAMPGROUND ROUTES
//============================================================

//============================================================
//INDEX - SHOW ALL CAMPGROUNDS
//============================================================
app.get("/campgrounds", function (req, res) {
    //GET CAMPGROUNDS DATA FROM DB
    Campground.find({}).populate("image").exec( function (err, allCampgrounds) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found campgrounds");
            res.redirect('/');
        } else {
            //IF ALL IS OK, RENDER PAGE WITH THAT DATA
            //RENDER DATA
            res.render("campgrounds/index", {
                campgrounds: allCampgrounds
            });
        }
    });
});

//============================================================
//CREATE - ADD NEW CAMPGROUND TO BD
//============================================================
app.post("/campgrounds", check.isLoggedIn, function (req, res) {
    //GET DATA FROM REQUEST 
    const name = req.body.name;
    const cost = req.body.cost;
    const description = req.body.description;
    const author = {
        id: req.user.id,
        username: req.user.username
    }

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

            const newCapm = {
                name: name,
                cost:cost,
                description: description,
                author: author
            };
        
            //SAVE NEW OBJECT TO BD
            Campground.create(newCapm, function (err, campground) {
                if (err) {
                    //IFF ERROR
                    req.flash('error', "Have some problems with creating Your comment. Please try again");
                    res.redirect('back');
                } else {
                    //IF ALL IS OK, CREATE IMAGE
                    const newImage = {
                        imagename: campground.id + '_' + imageName,
                        extension: extension
                    };
                    Image.create(newImage, function (err, createdImage) {
                        if (err) {
                            //IFF ERROR
                            req.flash('error', "Have some problems creating Your image. Please try again");
                            res.redirect('back');
                        } else {
                            // Use the mv() method to place the file somewhere on your server
                            fileImage.mv(`./images/${campground.id}_${imageName}.${extension}`, err => {
                                if (err){
                                    req.flash('error', "Have some problems with wrinting Your image. Please try again");
                                    res.redirect('back');
                                }else {
                                    //IF ALL IS OK, REDIRECT TO  PAGE WITH THAT DATA
                                    campground.image = createdImage;
                                    campground.save();
                                    req.flash('succes', "Successfully create campground");
                                    res.redirect("/campgrounds/" + campground.id);
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
});

//============================================================
//NEW - SHOW FORM TO CREATE NEW CAMPGROUND
//============================================================
app.get("/campgrounds/new", check.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

//============================================================
//SHOW - SHOWS MORE INFO ABOUT A SPECIFIC CAMPGROUND
//============================================================
app.get("/campgrounds/:id", function (req, res) {

    //FIND A CAMPGROUND
    Campground.findById(req.params.id).populate("comments").populate("image").exec(function (err, foundCampground) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found campground");
            res.redirect("/campgrounds")
        } else {

            //CHECK IF CAMPGROUND WITH THAT ID EXIST
            if (!foundCampground) {
                req.flash("error", "Campground not found.");
                return res.redirect("back");
            }

            //IF ALL IS OK, RENDER SHOW TEMPLATE WITH THAT CAMPGROUND
            res.render("campgrounds/show", {campground:foundCampground});
        }
    });
});

//============================================================
//EDIT - SHOW FORM TO EDIT EXISTING CAMPGROUND
//============================================================
app.get("/campgrounds/:id/edit", check.checkPermitions, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found campground");
            res.redirect('back');
        } else {

            //CHECK IF CAMPGROUND WITH THAT ID EXIST
            if (!foundCampground) {
                req.flash("error", "Campground not found.");
                return res.redirect("back");
            }

            //IF ALL IS OK, RENDER EDIT PAGE WITH CAMPGROUND DATA
            res.render('campgrounds/edit', {campground:foundCampground});
        }
    });
});

//============================================================
//UPDATE - UPDATE A SPECIFIC CAMPGROUND
//============================================================
app.put("/campgrounds/:id/", check.checkPermitions, function(req, res){

    const name = req.body.name;
    const cost = req.body.cost;
    const description = req.body.description;
    const updatedCamp = {
        name: name,
        cost:cost,
        description: description
    };
    Campground.findByIdAndUpdate(req.params.id, updatedCamp, function (err, updatedCampground) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found campground");
            res.redirect('back');
        } else {
            console.log(updatedCampground);
            //UPDATE IMAGE FILE OR GO TO CAMPGROUND

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
                        imagename: updatedCampground.id + '_' + imageName,
                        extension: extension
                    };
                    Image.create(newImage, function (err, createdImage) {
                        if (err) {
                            //IFF ERROR
                            req.flash('error', "Have some problems creating Your image. Please try again");
                            res.redirect('back');
                        } else {
                            // Use the mv() method to place the file somewhere on your server
                            fileImage.mv(`./images/${updatedCampground.id}_${imageName}.${extension}`, err => {
                                if (err){
                                    req.flash('error', "Have some problems with wrinting Your image. Please try again");
                                    res.redirect('back');
                                }else {
                                    //IF ALL IS OK, REDIRECT TO  PAGE WITH THAT DATA
                                    updatedCampground.image = createdImage;
                                    updatedCampground.save();
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
            //IF ALL IS OK, REDIRECT TO SHOW ROUTE WITH CAMPGROUND
            req.flash('succes', "Successfully update campground");
            res.redirect('/campgrounds/' + updatedCampground._id);
        }
    });

});

//============================================================
//DESTROY - DELETE A SPECIFIC CAMPGROUND
//============================================================
app.delete("/campgrounds/:id/", check.checkPermitions, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            //IFF ERROR
            req.flash('error', "Cannot found campground");
            res.redirect('back');
        } else {
            req.flash('succes', "Successfully delete campground");
            res.redirect('/campgrounds');
        }
    });
});

module.exports = app;