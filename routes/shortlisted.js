const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const JobApplicationModel = require("./../models/JobApplication");
const UsersModel = require("../models/Users");
const ShortlistedModel = require("../models/Shortlisted");
const routeProtect = require("./../middleware/protect");
mongoose.set("useFindAndModify", false);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/id/:_id/recid/:recid", function (req, res) {
  JobApplicationModel.findById(req.params._id).exec(function (
    error,
    applicantsData
  ) {
    var shortlistedObj = {
      jobID: applicantsData.jobID,
      appID: applicantsData.appID,
      recID: req.params.recid,
      firstName: applicantsData.firstName,
      lastName: applicantsData.lastName,
      email: applicantsData.email,
      phoneNumber: applicantsData.phoneNumber,
      resume: applicantsData.resume,
    };
    var newShortlist = new ShortlistedModel(shortlistedObj);
    newShortlist.save(function (error, result) {
      if (error) {
        throw error;
      } else {
        req.flash(
          "usershortlisted",
          '<p id="usershortlisted" class="bg-success" style="text-align: center; color: white; margin-top: 20px;">Applicant shortlisted successfully and saved in your profile</p>'
        );
        res.json("Shortlisted Successfully!");
      }
    });
  });
});

router.delete("/delete/:_id", function (req, res) {
  ShortlistedModel.findByIdAndDelete(req.params._id).exec(function (
    error,
    result
  ) {
    if (error) {
      throw error;
    } else {
      res.send("Removed from shortlist!");
    }
  });
});

module.exports = router;
