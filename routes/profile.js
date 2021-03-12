const express = require("express");
const router = express.Router();
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const JobApplicationModel = require("./../models/JobApplication");
const UsersModel = require("./../models/Users");
const ShortlistedModel = require("../models/Shortlisted");
const routeProtect = require("./../middleware/protect");
const routes = require("./routes");
// const buttonCodes = require('../files/buttons');
const multer = require("multer");

let loggedIn = `<form class="dropdown-item" action ="/auth/logout" method ="post"><button type="submit" class="btn btn-primary">Logout</button></form>`;

const fileStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    let uploadPath = "files/uploads/";
    return callback(null, uploadPath);
  },
  filename: function (req, file, callback) {
    let filename = new Date().getTime() + "-" + file.originalname;
    return callback(null, filename);
  },
});

const upload = multer({
  storage: fileStorage,
});

router.use(methodOverride("_method"));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
mongoose.set("useFindAndModify", false);

router.get("/id/:_id", routeProtect, function (req, res) {
  let userID = req.params._id;
  UsersModel.findById(userID).exec(function (error, userData) {
    if (error) {
      throw error;
    } else {
      let isJobSeeker;
      if (userData.accountType === "jobseeker") {
        isJobSeeker = "yes";

        JobApplicationModel.find({ appID: userID }).exec(function (
          error,
          result
        ) {
          res.render("profile", {
            title: "View & Update Your Profile - Procruiter",
            userID: userID,
            accountType: userData.accountType,
            name: userData.firstName,
            topname:
              "<p class='display-4 col-8'>Logged in as: " +
              userData.firstName +
              "</p>",
            buttons: loggedIn,
            jobsAppliedData: result,
            userData: userData,
            isJobSeeker: isJobSeeker,

            actions:
              "<button class='viewappliedjob-btn btn btn-primary' onclick='viewAppliedJobPost(this)'>View Details</button>",
            profupdatesuccess: req.flash("profupdatesuccess"),
          });
        });
      } else {
        ShortlistedModel.find({ recID: userID }).exec(function (
          error,
          shortlisted
        ) {
          res.render("profile", {
            title: "View & Update Your Profile - Procruiter",
            userID: userID,
            accountType: userData.accountType,
            name: userData.firstName,
            topname:
              "<p class='display-4 col-8'>Logged in as: " +
              userData.firstName +
              "</p>",
            buttons: loggedIn,
            shortlistedData: shortlisted,
            userData: userData,
            actions:
              "<button class='viewshortlistedjob-btn btn btn-primary' onclick='viewThatJob(this)'>View Job</button><button class='delete-btn btn btn-danger' onclick='removeFromShortlist(this)'>Remove</button>",
            profupdatesuccess: req.flash("profupdatesuccess"),
          });
        });
      }
    }
  });
});

router.put(
  "/update/",
  upload.single("resume"),
  routeProtect,
  function (req, res) {
    let resume;
    if (!req.file) {
      resume = req.body.resumePresent;
    } else {
      resume = req.file.path;
    }
    let profileObj = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      resume: resume,
    };
    UsersModel.findByIdAndUpdate(req.body.userID, profileObj, {
      new: true,
    }).exec(function (error, result) {
      if (error) {
        throw error;
      } else {
        req.flash(
          "profupdatesuccess",
          '<p id="updatesuccess" class="bg-success" style="text-align: center; color: white; margin-top: 20px;">Profile updated successfully</p>'
        );
        res.redirect(301, "/profile/id/" + req.body.userID);
      }
    });
  }
);

module.exports = router;
