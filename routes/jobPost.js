const express = require("express");
const router = express.Router();
const request = require("request");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const JobPostModel = require("./../models/JobPost");
const routeProtect = require("./../middleware/protect");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(flash());

mongoose.set("useFindAndModify", false);

router.post("/create", function (req, res) {
  var jobObj = {
    userID: req.body.userID,
    name: req.body.name,
    companyName: req.body.companyName,
    jobTitle: req.body.jobTitle,
    joblocation: req.body.joblocation,
    jobDescription: req.body.jobDescription,
    salary: req.body.salary,
  };
  var newJob = new JobPostModel(jobObj);
  newJob.save(function (error, result) {
    if (error) {
      throw error;
    } else {
      req.flash(
        "jobsuccess",
        '<p id="jobsuccess" class="bg-success" style="text-align: center; color: white;">Job posted successfully</p>'
      );
      res.redirect(
        301,
        "/recruiter/id/" +
          result.userID +
          "/name/" +
          result.name +
          "#jobsuccess"
      );
    }
  });
});

router.put("/update/", function (req, res) {
  var jobObj = {
    companyName: req.query.companyName,
    jobTitle: req.query.jobTitle,
    joblocation: req.query.joblocation,
    jobDescription: req.query.jobDescription,
    salary: req.query.salary,
  };
  JobPostModel.findByIdAndUpdate(req.query._id, jobObj, {
    new: true,
  }).exec(function (error, result) {
    if (error) {
      throw error;
    } else {
      req.flash(
        "updatesuccess",
        '<p id="updatesuccess" class="bg-success" style="text-align: center; color: white;">Job updated successfully</p>'
      );
      res.json("Post has been updated succesfully");
    }
  });
});

router.delete("/delete/:_id", function (req, res) {
  JobPostModel.findByIdAndDelete(req.params._id).exec(function (error, result) {
    if (error) {
      throw error;
    } else {
      res.send("Post has been deleted now!!");
    }
  });
});

module.exports = router;
