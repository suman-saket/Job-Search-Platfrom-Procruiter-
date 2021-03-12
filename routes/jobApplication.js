const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const JobApplicationModel = require("./../models/JobApplication");
const UsersModel = require("../models/Users");
const routeProtect = require("./../middleware/protect");

mongoose.set("useFindAndModify", false);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/apply", function (req, res) {
  UsersModel.findById(req.query.appID).exec(function (error, userData) {
    if (!userData.resume) {
      req.flash(
        "applyfailure",
        '<p id="applyfailure" class="bg-danger" style="text-align: center; color: white; margin-top: 15px;">Please upload your resume from your profile before proceeding.</p>'
      );
      res.json("Application Not Submitted!!");
    } else {
      var applicationObj = {
        jobID: req.query.jobID,
        appID: req.query.appID,
        firstName: req.query.firstName,
        lastName: req.query.lastName,
        email: req.query.email,
        phoneNumber: req.query.phoneNumber,
        resume: userData.resume,
      };
      var newApplication = new JobApplicationModel(applicationObj);
      newApplication.save(function (error, result) {
        if (error) {
          throw error;
        } else {
          req.flash(
            "applysuccess",
            '<p id="applysuccess" class="bg-success" style="text-align: center; color: white; margin-top: 15px;">Applied successfully</p>'
          );
          res.json("Application Submitted!!");
        }
      });
    }
  });
});

router.delete("/delete/:_id", function (req, res) {
  JobApplicationModel.findByIdAndDelete(req.params._id).exec(function (
    error,
    result
  ) {
    if (error) {
      throw error;
    } else {
      res.send("Application has been deleted now!!");
    }
  });
});

module.exports = router;
