require('module-alias/register')

const express = require("express");
const _ = require('underscore');
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const dbFuncs = require('./dbFuncs');
const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-find"));
const fileUpload = require("express-fileupload");
const pmodel = require('@models/patientModel');
const umodel = require('@models/userModel');
const index_controller = require('@controllers/index_controller');
const view_controller = require('@controllers/view_controller');
const patients_controller = require('@controllers/patients_controller');
const demo_controller = require('@controllers/demo_controller');
const admin_controller = require('@controllers/admin_controller');
const auth_controller = require('@controllers/auth_controller');
const user_controller = require('@controllers/user_controller');
const app = express();


var dbname = "patients";
var db = new PouchDB(dbname);


("use strict");

hbs.registerPartials(path.join(__dirname , "views/partials"));
//call this to pass data from an onclick to javascript function in the view
hbs.registerHelper("json", function(obj) {
  return new hbs.SafeString(JSON.stringify(obj));
});
//fileUpload is from express-fileUpload
app.use(fileUpload({ preserveExtension: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//DO NOT CHANGE THIS - REQUIRED TO RUN BOOTSTRAP LOCALLY
app.use(express.static(__dirname));
// app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set("view engine", "hbs");
// var instance2 = hbs.create();
// app.engine("html", instance2.__express);
//allows local data to be used in the template
// hbs.localsAsTemplateData(app);
// syntax: app.locals.foo = "bar"'
//{{@foo}}



//start routes


app.get("/", index_controller.home_page);
app.post("/login", auth_controller.login);

//get patients listing page
app.get("/patients", patients_controller.render_patients);
//post edit form
app.post("/patients/edit", patients_controller.post_edit_patient);
//post patient attachment
app.post("/patients/upload", patients_controller.file_upload);
//post creat patient
app.post("/patients", patients_controller.add_patient);
//get add page
app.get("/patients/add", patients_controller.render_addPage);
//get patients list page
//get edit form page
app.get("/patients/edit/:id", patients_controller.get_edit_patient);
app.post("/patients/delete/:id", patients_controller.delete_patient);



app.get("/view/:id", view_controller.view_patient);
app.get("/view/soap/:id", view_controller.render_soap);
app.post("/view/soap/:id", view_controller.post_soap);
app.get("/view_rx", view_controller.view_rx);


app.get("/rxnorm", (req, res) => {
  res.render("rxnorm");
});

app.get("/icd10", (req, res) => {
  res.render("icd10");
});

app.get("/admin", admin_controller.render_admin);
app.post("/admin/destroy", admin_controller.delete_db);
app.post("/admin/sample", admin_controller.sample_data);
app.post("/admin/createdb", admin_controller.create_db);
app.get("/admin/build_index", admin_controller.build_index);
app.get("/admin/replicate_patients", admin_controller.replicate_patients);
app.get("/admin/replicate_users", admin_controller.replicate_users);
app.get("/admin/build_find_indexes", admin_controller.build_find_indexes);
app.get("/admin/replicate_from_remote", admin_controller.replicate_from_remote);


app.post("/users/create", user_controller.create_user);
app.get("/users", user_controller.render_users);
app.post("/users/:id", user_controller.read_user);
app.get("/users/update/:id", user_controller.update_user);
app.get("/users/remove/:id", user_controller.remove_user);

app.get("/rx", (req, res) => {
  const title = "JDC Pharmacy";
  res.render("rx", {
    title: title
  });
});

app.get("/demo", demo_controller.demo_render);
app.get("/demo/patients", demo_controller.demo_patients);

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
