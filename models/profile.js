const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  FirstName: {
    type: String,
  },

  LastName: {
    type: String,
  },

  Email: {
    type: String,
  },

  Phone: {
    type: String,
  },

  fileUrl: {
    type: String,
  },
});

module.exports = mongoose.model("profile", profileSchema);
