const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const helpers = require("@root/helpers");


exports.home_page = ((req, res) => {
  res.render("index", {
    replication: req.app.replication,
    userid: false
  });
});
