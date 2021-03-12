const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const scripts = require("../files/scripts");
const UserModel = require("./../models/Users");
const mongoose = require("mongoose");
const async = require("async");
const nodemailer = require("nodemailer");
var crypto = require("crypto");
const routeProtect = require("./../middleware/protect");

mongoose.set("useFindAndModify", false);

const EUSER = process.env.EUSER;
const EPASS = process.env.EPASS;

var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = new JSDOM("").window;
global.document = document;

var $ = (jQuery = require("jquery")(window));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(flash());

router.post("/sign-up", function (req, res) {
  UserModel.findOne(
    {
      email: req.body.email,
    },
    function (error, result) {
      if (error) {
        throw error;
      } else if (result == null) {
        bcrypt.hash(req.body.password, 12, function (error, hash) {
          if (error) {
            return res.json({
              error: error,
            });
          } else {
            if (req.body.password == req.body.confirmPassword) {
              var userObj = {
                accountType: req.body.accountType,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                password: hash,
              };

              var newUser = new UserModel(userObj);

              newUser.save(function (error, result) {
                if (error) {
                  throw error;
                } else {
                  req.flash(
                    "successmsg",
                    '<p class="bg-success" style="text-align: center; color: white;">Account created. Please login below.</p>'
                  );
                  res.redirect(301, "/login");
                }
              });
            } else {
              scripts.conf;
            }
          }
        });
      } else {
        req.flash(
          "message",
          '<p class="errormsg bg-danger" style="text-align: center; color: white;">Email already exists. Please login below.</p>'
        );
        req.flash("useremail", req.body.email);
        res.redirect(301, "/login");
      }
    }
  );
});

router.post("/login", function (req, res) {
  UserModel.findOne(
    {
      email: req.body.email,
    },
    function (error, result) {
      if (error) {
        throw error;
      } else if (result == null) {
        req.flash(
          "userNotFound",
          '<p class="bg-danger" style="text-align: center; color: white;">User not found. Please sign up below.'
        );
        res.redirect(301, "/sign-up");
      } else if (result) {
        bcrypt.compare(
          req.body.password,
          result.password,
          function (error, user) {
            if (!user) {
              req.flash(
                "incorPass",
                '<p class="bg-danger" style="text-align: center; color: white;">Incorrect password. Please try again.</p>'
              );
              res.redirect(301, "/login");
            } else {
              req.session.user = result._id;
              if (req.body.accountType === result.accountType) {
                if (req.body.accountType === "recruiter") {
                  res.redirect(
                    301,
                    "/recruiter/id/" + result._id + "/name/" + result.firstName
                  );
                } else {
                  res.redirect(
                    301,
                    "/jobseeker/id/" + result._id + "/name/" + result.firstName
                  );
                }
              } else {
                if (req.body.accountType === "recruiter") {
                  req.flash(
                    "norecruiter",
                    '<p class="bg-danger"     style="text-align: center; color: white;">No recruiter account     found with these credentials.</p>'
                  );
                  res.redirect(301, "/login");
                } else {
                  req.flash(
                    "nojobseeker",
                    '<p class="bg-danger" style="text-align: center; color: white;">No jobseeker account found with these credentials.</p>'
                  );
                  res.redirect(301, "/login");
                }
              }
            }
          }
        );
      }
    }
  );
});

router.post("/logout", routeProtect, function (req, res) {
  req.flash(
    "loggedoutmsg",
    '<p class="bg-success" style="text-align: center; color: white;">Successfully logged out!</p>'
  );
  res.redirect(301, "/");
  req.session.destroy();
});

router.post("/forgot-password", function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function (token, done) {
        UserModel.findOne({ email: req.body.email }, function (err, user) {
          if (!user) {
            req.flash(
              "noUserFound",
              '<p class="bg-danger" style="text-align: center; color: white;">No account with that email address exists.</p>'
            );
            res.redirect(302, "/forgot-password");
          } else {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            user.save(function (err) {
              done(err, token, user);
            });
          }
        });
      },
      function (token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: EUSER,
            pass: EPASS,
          },
        });
        var mailOptions = {
          to: user.email,
          from: "procruiterorg@gmail.com",
          subject: "Reset Your Password - Procruiter",
          text:
            "You are receiving this email because you (or someone else) has requested a password reset for your account on Procruiter.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/reset/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          req.flash(
            "mailSent",
            '<p class="bg-success" style="text-align: center; color: white;">An e-mail has been sent to ' +
              user.email +
              " with further instructions.</p>"
          );
          done(err, "done");
        });
      },
    ],
    function (err) {
      if (err) return next(err);
      res.redirect(302, "/forgot-password");
    }
  );
});

router.post("/reset/:token", function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        UserModel.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
          },
          function (err, user) {
            if (!user) {
              req.flash(
                "error",
                "Password reset token is invalid or has expired."
              );
              return res.redirect("back");
            }
            if (req.body.password === req.body.confirm) {
              bcrypt.hash(req.body.password, 12, function (error, hash) {
                if (error) {
                  return res.json({
                    error: error,
                  });
                }
                user.password = hash;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.save(function (err) {
                  done(err, user);
                });
              });
            } else {
              req.flash(
                "passNoMatch",
                "<p class='bg-danger' style='text-align: center; color: white;'>Passwords don't match.</p>"
              );
              res.redirect(302, "/reset/" + req.params.token);
            }
          }
        );
      },
      function (user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: EUSER,
            pass: EPASS,
          },
        });
        var mailOptions = {
          to: user.email,
          from: "procruiterorg@gmail.com",
          subject: "Your password has been changed - Procruiter",
          text:
            "Hello " +
            user.firstName +
            ",\n\n" +
            "The password for your account " +
            user.email +
            " at Procruiter has just been changed.\n\n" +
            "Please reply to this email immediately if you don't recall resetting your password.\n",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          req.flash(
            "passChanged",
            '<p class="bg-success" style="text-align: center; color: white;">Password changed successfully. Please login below.</p>'
          );
          done(err);
        });
      },
    ],
    function (err) {
      if (err) return next(err);
      res.redirect(302, "/login");
    }
  );
});

module.exports = router;
