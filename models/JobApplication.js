const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var JobApplicationSchema = new Schema({
  jobID: {
    type: String,
    required: true,
  },
  appID: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  resume: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("JobApplication", JobApplicationSchema);
