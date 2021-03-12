const express = require("express");
const router = express.Router();
const request = require("request");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const JobPostModel = require("./../models/JobPost");
const JobApplicationModel = require("./../models/JobApplication");
const UsersModel = require("./../models/Users");
const routeProtect = require("./../middleware/protect");
const buttonsCode = require("../files/buttons");
const loggedOut = `<a href="/login"><button type="button" class="btn btn-primary">Login</button></a>
<a href="/sign-up"><button type="button" class="btn btn-primary">Sign Up</button></a>`;

const loggedIn = `<form class="dropdown-item" action ="/auth/logout" method ="post"><button type="submit" class="btn btn-primary">Logout</button></form>`;

let buttons;
router.use(flash());
mongoose.set("useFindAndModify", false);

router.get("/", function (req, res) {
  if (!req.session.user) {
    buttons = loggedOut;
  } else {
    buttons = loggedIn;
  }
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    JobPostModel.find({ jobTitle: regex }).exec(function (error, result) {
      if (error) {
        throw error;
      } else {
        var noMatch;
        if (result.length < 1) {
          noMatch = "No job roles match your search, please try again later.";
        }
        res.render("homepage", {
          title: "Search for Your Dream Job - Procruiter",
          applicationData: result,
          actions:
            "<a href='/login'><button class='btn btn-primary'>Login to     Apply</button></a>",
          loggedoutmsg: req.flash("loggedoutmsg"),
          buttons: buttons,
          noMatch: noMatch,
          isLoggedOut: "yes",
          allJobs:
            "<a id='search-jobs-btn' href='/#allavailablejobs'><button class='btn btn-primary'>View All Jobs</button></a>",
        });
      }
    });
  } else {
    JobPostModel.find({}).exec(function (error, result) {
      if (error) {
        throw error;
      } else {
        res.render("homepage", {
          title: "Search for Your Dream Job - Procruiter",
          applicationData: result,
          actions:
            "<a href='/login'><button class='btn btn-primary'>Login to     Apply</button></a>",
          loggedoutmsg: req.flash("loggedoutmsg"),
          isLoggedOut: "yes",
          buttons: buttons,
        });
      }
    });
  }
});

router.get("/recruiter/id/:_id/name/:name", routeProtect, function (req, res) {
  let userID = req.params._id;
  let name = req.params.name;
  JobPostModel.find({ userID }).exec(function (error, result) {
    if (error) {
      throw error;
    } else {
      res.render("recruiter", {
        title: "Recruiter Dashboard - Procruiter",
        applicationData: result,
        actions:
          "<button class='receivedapps-btn btn btn-success' onclick='viewReceivedApps(this)'>Received Applications</button><button class='jobviewupdate-btn btn btn-primary delete-btn' onclick='viewJobPost(this)'>Update Details</button><button class='delete-btn btn btn-danger' onclick='deleteJobPost(this)'>Delete</button>",
        topname: "<p class='display-4 col-8'>Logged in as: " + name + "</p>",
        name: name,
        accountType: "recruiter",
        jobsuccess: req.flash("jobsuccess"),
        buttons: loggedIn,
        userID: userID,
      });
    }
  });
});

router.get("/jobseeker/id/:_id/name/:name", routeProtect, function (req, res) {
  let applicantID = req.params._id;
  let name = req.params.name;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    JobPostModel.find({ jobTitle: regex }).exec(function (error, result) {
      if (error) {
        throw error;
      } else {
        var noMatch;
        if (result.length < 1) {
          noMatch = "No job roles match your search, please try again later.";
        }
        res.render("jobseeker", {
          title: "Job Seeker Dashboard - Procruiter",
          applicationData: result,
          actions:
            "<button onclick='viewJobPostAsApplicant(this)' class='jobviewapply-btn btn btn-primary'>View Details & Apply</button>",
          topname: "<p class='display-4 col-8'>Logged in as: " + name + "</p>",
          name: name,
          accountType: "jobseeker",
          buttons: loggedIn,
          userID: applicantID,
          noMatch: noMatch,
          allJobs:
            "<a id='search-jobs-btn' href='/jobseeker/id/" +
            applicantID +
            "/name/" +
            name +
            "'><button class='btn btn-primary'>View All Jobs</button></a>",
        });
      }
    });
  } else {
    JobPostModel.find({}).exec(function (error, result) {
      if (error) {
        throw error;
      } else {
        res.render("jobseeker", {
          title: "Job Seeker Dashboard - Procruiter",
          applicationData: result,
          actions:
            "<button onclick='viewJobPostAsApplicant(this)' class='jobviewapply-btn btn btn-primary'>View & Apply</button>",
          topname: "<p class='display-4 col-8'>Logged in as: " + name + "</p>",
          name: name,
          accountType: "jobseeker",
          buttons: loggedIn,
          userID: applicantID,
        });
      }
    });
  }
});

router.get("/sign-up", function (req, res) {
  res.render("sign-up", {
    title: "Create a New Account - Procruiter",
    userNotFound: req.flash("userNotFound"),
    isLoggedOut: "yes",
    buttons: loggedOut,
  });
});

router.get("/login", function (req, res) {
  res.render("login", {
    title: "Login - Procruiter",
    message: req.flash("message"),
    successmsg: req.flash("successmsg"),
    incorPass: req.flash("incorPass"),
    userEmail: req.flash("useremail"),
    noJobSeeker: req.flash("nojobseeker"),
    noRecruiter: req.flash("norecruiter"),
    passChanged: req.flash("passChanged"),
    isLoggedOut: "yes",
    buttons: loggedOut,
  });
});

router.get(
  "/job/id/:_id/recid/:recid/name/:name",
  routeProtect,
  function (req, res) {
    let jobID = req.params._id;
    JobPostModel.findById(jobID).exec(function (error, result) {
      if (error) {
        throw error;
      } else {
        res.render("job-update", {
          title: "View/Update Job Details - Procruiter",
          buttons: loggedIn,
          topname:
            "<p class='display-4 col-8'>Logged in as: " +
            req.params.name +
            "</p>",
          ID: jobID,
          userID: req.params.recid,
          accountType: "recruiter",
          name: req.params.name,
          data: result,
          updatesuccess: req.flash("updatesuccess"),
        });
      }
    });
  }
);

router.get("/viewjob/id/:_id/appid/:appid", routeProtect, function (req, res) {
  let jobID = req.params._id;
  let appID = req.params.appid;
  JobPostModel.findById(jobID).exec(function (error, result) {
    if (error) {
      throw error;
    } else {
      UsersModel.findById(appID).exec(function (err, userData) {
        res.render("job-apply", {
          title: "View & Apply for Job - Procruiter",
          buttons: loggedIn,
          ID: jobID,
          userID: appID,
          data: result,
          userData: userData,
          accountType: "jobseeker",
          name: userData.firstName,
          topname:
            "<p class='display-4 col-8'>Logged in as: " +
            userData.firstName +
            "</p>",
          applysuccess: req.flash("applysuccess"),
          applyfailure: req.flash("applyfailure"),
        });
      });
    }
  });
});

router.get(
  "/appliedjob/id/:_id/appid/:appid",
  routeProtect,
  function (req, res) {
    let jobID = req.params._id;
    let appID = req.params.appid;
    JobPostModel.findById(jobID).exec(function (error, result) {
      if (error) {
        throw error;
      } else {
        JobApplicationModel.find({ appID: appID }).exec(function (
          err,
          userData
        ) {
          res.render("job-view", {
            title: "View Job Details - Procruiter",
            buttons: loggedIn,
            ID: jobID,
            userID: appID,
            data: result,
            userData: userData[0],
            accountType: "jobseeker",
            topname:
              "<p class='display-4 col-8'>Logged in as: " +
              userData[0].firstName +
              "</p>",
            name: userData[0].firstName,
          });
        });
      }
    });
  }
);

router.get(
  "/received-applications/id/:_id/recid/:recid/name/:name",
  routeProtect,
  function (req, res) {
    let jobID = req.params._id;
    let recID = req.params.recid;
    JobApplicationModel.find({ jobID: jobID }).exec(function (error, result) {
      if (error) {
        throw error;
      } else {
        let noMatch;
        if (result.length < 1) {
          noMatch = "No applications received for this job, yet.";
        }
        res.render("received-applications", {
          title: "Applications Received for Job - Procruiter",
          buttons: loggedIn,
          ID: jobID,
          userID: recID,
          accountType: "recruiter",
          name: req.params.name,
          topname:
            "<p class='display-4 col-8'>Logged in as: " +
            req.params.name +
            "</p>",
          actions:
            "<button class='btn btn-success' onclick='shortlistApplication(this)'>Shortlist</button><button class='delete-btn btn btn-danger' onclick='deleteApplication(this)'>Delete</button>",
          appsReceivedData: result,
          shortlisted: req.flash("usershortlisted"),
          noMatch: noMatch,
        });
      }
    });
  }
);

router.get("/forgot-password", function (req, res) {
  res.render("forgot", {
    title: "Reset Your Password - Procruiter",
    buttons: loggedOut,
    invalidToken: req.flash("invalidToken"),
    noAccount: req.flash("noUserFound"),
    mailSent: req.flash("mailSent"),
    isLoggedOut: "yes",
  });
});

router.get("/reset/:token", function (req, res) {
  UsersModel.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    function (err, user) {
      if (!user) {
        req.flash(
          "invalidToken",
          '<p class="bg-danger" style="text-align: center; color: white;">Password reset token is invalid or expired.</p>'
        );
        return res.redirect(302, "/forgot-password");
      }
      res.render("reset", {
        title: "Reset Your Password - Procruiter",
        buttons: loggedOut,
        token: req.params.token,
        passNoMatch: req.flash("passNoMatch"),
        isLoggedOut: "yes",
      });
    }
  );
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
