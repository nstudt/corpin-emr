const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//DO NOT CHANGE THIS - REQUIRED TO RUN BOOTSTRAP LOCALLY

// app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set("view engine", "hbs");
var instance2 = hbs.create();
app.engine("html", instance2.__express);
hbs.registerPartials("../views/partials");

exports.home_page = ((req, res) => {
  const title = "Welcome";
  res.render("index", {
    title: title
  });
});
