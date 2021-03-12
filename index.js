const express = require("express");
const favicon = require("express-favicon");
const app = express();
const path = require("path");
const exphbs = require("express-handlebars");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const auth = require("./routes/auth");
const routes = require("./routes/routes");
const jobPost = require("./routes/jobPost");
const job = require("./routes/jobApplication");
const profile = require("./routes/profile");
const shortlist = require("./routes/shortlisted");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");

app.use(
  session({
    name: "test",
    secret: "saanahdwondw45",
    resave: true,
    rolling: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 3600000,
      path: "/",
      sameSite: true,
      secure: false,
    },
  })
);

// Atlas connection
if (process.env.NODE_ENV === "staging") {
  const DB_USERNAME = process.env.DB_USERNAME;
  const DB_PASSWORD = process.env.DB_PASSWORD;
  const DB_URL = process.env.DB_URL;
  mongoose.connect(
    "mongodb+srv://" + DB_USERNAME + ":" + DB_PASSWORD + "@" + DB_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    function (error) {
      if (!error) console.log("Server has been connected to mongodb ATLAS");
    }
  );
} else {
  mongoose.connect(
    "mongodb://127.0.0.1:27017/procruiter-app",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    function (error, res) {
      if (error) {
        throw error;
      } else {
        console.log("Server has been coonected to mongodb LOCAL");
      }
    }
  );
}

app.use(cors());

// Setting a static directory for all assets and a favicon

app.use("/files", express.static("files"));
app.use(favicon(path.join(__dirname, "files", "favicon.ico")));

// Separating all routes

app.use("/", routes);
app.use("/auth", auth);
app.use("/jobpost", jobPost);
app.use("/applyjob", job);
app.use("/profile", profile);
app.use("/shortlist", shortlist);

// Using body parser

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration of Handlebars
app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", "hbs");

// ENV variables
const ENV = process.env.NODE_ENV || "default";
const PORT = process.env.PORT || 9999;

// Start the app on pre defined port number
app
  .listen(PORT, function () {
    console.log(
      "Application has started in environment : " +
        ENV +
        " and running on port: ",
      PORT
    );
  })
  .on("error", function (error) {
    console.log("Unable to start app. Error >>>>", error);
  });

// Handles all 404 errors (must be at the end of index.js)

app.get("*", function (req, res) {
  res.render("404", {
    title: "404 Not Found",
  });
});
