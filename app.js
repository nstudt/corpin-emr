require('module-alias/register');
const express = require("express");
const app = express();
const http = require('http').Server(app);
var socket = require('socket.io')
const _ = require('underscore');
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-find"));
const fileUpload = require("express-fileupload");
const index_controller = require('@controllers/index_controller');
const view_controller = require('@controllers/view_controller');
const patients_controller = require('@controllers/patients_controller');
const admin_controller = require('@controllers/admin_controller');
const auth_controller = require('@controllers/auth_controller');
const user_controller = require('@controllers/user_controller');
const helpers = require("@root/helpers");
const dbFuncs = require("@root/dbFuncs");

const events = require('events').EventEmitter;
var dbname = "patients";
var db = new PouchDB(dbname);
var udb_name = "userdb";
var udb = new PouchDB(udb_name);

'use strict';

//fileUpload is from express-fileUpload
app.use(fileUpload({ preserveExtension: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.db = db;
app.udb = udb;
app.batch_size = 100;
app.timeout = 5000;
app.dbinfo = new helpers.DBINFO();
app.udbinfo = new helpers.DBINFO();
app.replication = "off";
app.app_path = __dirname;
app.physician_id = "CorpinChloe"; //dev only

// app.use('/admin/toggle_repl', function(req, res, next) {
//   try{
//     app.set('replication', 'on');
//   }
//   catch(err) {
//     console.log(err)
//   }
//    next();
// });

//DO NOT CHANGE THIS - REQUIRED TO RUN BOOTSTRAP LOCALLY
app.use(express.static(__dirname));
app.set("view engine", "hbs");

hbs.registerPartials(path.join(__dirname , "views/partials"));

//call this to pass data from an onclick to javascript function in the view
hbs.registerHelper("json", function(obj) {
  return new hbs.SafeString(JSON.stringify(obj));
});

hbs.registerHelper('list', function(items, options) {
  var out = "<ul>";
  for(var i=0, l=items.length; i<l; i++) {
    out = out + "<li>" + options.fn(items[i]) + "</li>";
  }
  return out + "</ul>";
});

//start routes
app.get('/test', function(req, res) {
  res.render('test');
})

app.get("/", index_controller.home_page);
app.post("/login", auth_controller.login);

app.get("/patients", patients_controller.render_patients);
app.post("/patients/edit", patients_controller.post_edit_patient);
app.post("/patients/upload", patients_controller.file_upload);
app.post("/patients", patients_controller.add_patient);
app.get("/patients/add", patients_controller.render_addPage);
app.get("/patients/edit/:id", patients_controller.get_edit_patient);
app.post("/patients/delete/:id", patients_controller.delete_patient);
app.post("/patients/search", patients_controller.search);

app.get("/view/:id", view_controller.view_patient);
app.get("/view/soap/:id", view_controller.render_soap);
app.post("/view/soap/:id", view_controller.post_soap);
app.post("/view/rx", view_controller.view_rx);
app.post("/view/write_rx", view_controller.write_rx);

app.get("/rxnorm", (req, res) => {
  res.render("rxnorm");
});

app.get("/icd10", (req, res) => {
  res.render("icd10");
});
app.get("/admin", admin_controller.render_admin);
app.post("/admin/destroy", admin_controller.delete_db);
app.get("/admin/sample", admin_controller.sample_data);
app.get("/admin/createdb", admin_controller.create_db);
app.get("/admin/build_index", admin_controller.build_index);
app.get("/admin/build_index2", admin_controller.build_index2);
app.post("/admin/replicate_patients", admin_controller.replicate_patients);
app.post("/admin/replicate_users", admin_controller.replicate_users);
app.get("/admin/build_find_index", admin_controller.build_find_index);
app.get("/admin/build_find_index2", admin_controller.build_find_index2);
app.get("/admin/replicate_from_remote", admin_controller.replicate_from_remote);
app.post("/admin/replicate_to_remote", admin_controller.replicate_to_remote);

app.post("/users/create", user_controller.create_user);
app.post("/users/edit", user_controller.edit_user);
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


const port = 5000;
http.listen(port, function(){
  console.log('listening on:', port);
  check_dbs(app.db, app.udb);
});

function check_dbs(dbt, udbt) {
  
    return dbt.info()
    .then((result) => {
      console.log(`${result.db_name} database is ready;`, result);
      return udbt.info()
    }).then((result2) => {
      console.log(`${result2.db_name} udb is ready;`, result2);
      if (result2.doc_count == 0){
        console.log('user database contains no users. Creating default admin account')
        //new installation detected, because no user detected
        return dbFuncs.initialize_udb(udbt)
        .then((result3) => {
          console.log('user created', result3)
        })
      }
      console.log('udb contains users');
      return udbt.allDocs()
      }).then((docs) => {
        console.log('users db:', docs);
      })
    .catch((err) => {
      console.log(err);
    });
    
 
}

var io = require('socket.io')(http);
app.io = io;

io.on('connection', function (socket) {
  let msg = "connected to server";
  socket.on('response', function (data) {
    console.log(data);
  });
});