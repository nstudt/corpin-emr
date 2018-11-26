const os = require("os");
const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const app = express();
const session = require("express-session");
const dbFuncs = require("@root/dbFuncs");
const PouchDB = require("pouchdb");
const helpers = require("@root/helpers");
PouchDB.plugin(require("pouchdb-find"));
const dbname = "patients";
const udb_name = "userdb";
const umodel = require("@models/userModel");
const pmodel = require("@models/patientModel");
// const batch_size = 100;    // replication
// const timeout = 5000; //replication

var system = new helpers.local_system();

("use strict");
var HOST = "http://admin:Sdfg@345@52.74.45.66:5984/patients";
// var remoteDB = new PouchDB('http://52.74.45.66:5984/patients');
// var remoteUDB = new PouchDB('http://52.74.45.66:5984/userdb');
var remoteDB = new PouchDB("http://192.168.0.180:2000/patients");
var remoteUDB = new PouchDB("http://192.168.0.180:2000/userdb");

module.exports.toggle_repl = (req, res) => {
  repl_state = req.app.get("replication");
  res.send(repl_sate);
};

module.exports.render_admin = (req, res) => {
  system.uptime = os.uptime();
  return dbFuncs.get_dbinfo(req.app.db)
  .then((info) => {
    req.app.dbinfo.info = info;
    res.render("admin", {
      info: req.app.dbinfo.info,
      //udbinfo: req.app.udbinfo.info,
      remoteDB: remoteDB,
      remoteUDB: remoteUDB,
      system: system,
      replication: req.app.replication
    });
  }).catch((err) => {
    console.log(err)
  });
}

module.exports.create_db = (req, res) => {
  app.db = dbFuncs.prep_db(req.app.db, dbname);
  if (app.db == false) {
    console.log("error creating db");
  }
  res.redirect("/admin");
};

module.exports.delete_db = (req, res) => {
  db = req.app.db;
  udb = req.app.udb;
  return db.destroy()
    .then(response => {
      console.log("db.destroy", response);
      udb.destroy()
    }).then((response) => {
      console.log('udb.destroy: ', response);
      res.redirect("/admin/createdb");
    }).catch(err => {
      console.log("error during destroy", err);
    });
};

module.exports.sample_data = (req, res) => {
  console.log("creating samples");
  pmodel.samplePatients(req.app.db);
  return dbFuncs
    .makeVisits(req.app.db)
    .then((result) => {
      console.log('result of makeVisits', result);
      res.render('admin');
    })
    .catch(err => {
      console.log("error crating sample user", err);
    });
};

module.exports.build_index = (req, res) => {
  return dbFuncs.build_index(req.app.db)
    .then(result => {
      console.log("result of build_index(db)", result);
     helpers.emit_to_client(req.app.io, 'message', 'index build success!');
      dbFuncs.dbQuery(req.app.db, "index/visits", "a123456");
    })
    .then(() => {
      dbFuncs.dbQuery(req.app.db, "index/patients_only", 'a123456');
    })
    .then(() => {
      res.redirect("/admin");
    })
    .catch(err => {
          console.log("error in setting/buildQuery", err);
    });
};

module.exports.build_index2 = (req, res) => {
  return dbFuncs.build_index2(req.app.udb)
    .then(result => {
      console.log("result of build_index2(udb)", result);
      helpers.emit_to_client(req.app.io, 'message', 'index build success!');
    })
    .then(() => {
      dbFuncs.dbQuery(req.app.udb, "index2/users_only", 'la23ks45jf76');
    })
    .then(() => {
      res.redirect("/admin");
    })
    .catch(err => {
          console.log("error in setting/buildQuery", err);
    });
};

module.exports.build_find_index = (req, res) => {
  return dbFuncs
    .buildPatientsFindIndex(req.app.db)
    .then(result => {
      console.log("from build_find_indexes", result);
      res.redirect("/patients");
      helpers.emit_to_client(req.app.io, 'message', 'mango indexes build success!');
    })
    .catch(err => {
      console.log("from build_find_indexes", err);
      helpers.emit_to_client(req.app.io, 'message', 'failed to build mango queries.');
    });
};

module.exports.build_find_index2 = (req, res) => {
  return dbFuncs
    .buildUsersFindIndex(req.app.udb)
    .then(result => {
      console.log("from build user index", result);
      res.redirect("/admin");
      helpers.emit_to_client(req.app.io, 'message', 'mango indexes build success!');
    })
    .catch(err => {
      console.log("from user_indexes", err);
      helpers.emit_to_client(req.app.io, 'message', 'failed to build mango queries.');
    });
};

module.exports.replicate_from_remote = (req, res) => {
  var db = req.app.db;
  console.log("starting replication");
  db.replicate
    .from(remoteDB, {
      live: false,
      retry: true,
      back_off_function: function(delay) {
        console.log("backoff delay: ", delay);
        if (delay === 0) {
          return 1000;
        }
        return delay * 3;
      },
      timeout: req.app.timeout,
      batch_size: req.app.batch_size
    })
    .on('change', info => {
      console.log('Replication Progress', helpers.getProgress(info.pending));
      helpers.emit_to_client(req.app.io, 'replication', 'true');
    })
    .on("complete", result => {
      console.log(" pull relication result", result);
      console.log("stopped replication after completion");
      helpers.emit_to_client(req.app.io, 'replication', 'false');
    })
    .on("denied", err => {
      console.log("deny happened during pull of patients from remote: ", err);
      helpers.emit_to_client(req.app.io, 'message', 'A deny error has occured during replication. Please restart server.');
    })
    .on("error", err => {
      console.log("error during pull replcation", err);
    });
  
};

module.exports.replicate_to_remote = (req, res) => {
  var db = req.app.db;
  console.log("starting replication");
  app.set("replication", "on");
  console.log(app.get("replication"));
  db.replicate
    .to(remoteDB, {
      live: true,
      retry: true,
      back_off_function: function(delay) {
        console.log("backoff delay: ", delay);
        if (delay === 0) {
          return 1000;
        }
        return delay * 3;
      },
      timeout: req.app.timeout,
      batch_size: req.app.batch_size
    })
    .on("complete", result => {
      console.log(" pull relication result", result);
      res.redirect("/patients");
      req.app.set("replication", "off");
      helpers.emit_to_client(req.app.io, 'message', 'completed replication to server');
    })
    .on('change', info => {
      req.app.set("replication", "on");
      console.log("replication in progress");
      console.log('Replication Progress', helpers.getProgress(info.pending));
    })
    .on("denied", err => {
      console.log("deny happened during pull of patients from remote: ", err);
      req.app.set("replication", "error");
      helpers.emit_to_client(req.app.io, 'message', 'A deny error has occured during replication. Please restart server.');
    })
    .on("error", err => {
      console.log("error during pull replcation", err);
      req.app.set("replication", "error");
    });
};

module.exports.replicate_patients = (req, res) => {
  var db = req.app.db;
  //sync is used for production
  db.sync(remoteDB, {
    live: true,
    retry: true,
    back_off_function: function(delay) {
      console.log("backoff delay: ", delay);
      if (delay === 0) {
        return 1000;
      }
      return delay * 3;
    },
    timeout: timeout,
    batch_size: batch_size
  })
  .on('change', info => {
    req.app.set("replication", "on");
    console.log('Replication Progress', helpers.getProgress(info.pending));
    })
    .on("error", err => {
      req.app.replication = "error";
      console.log("error in replication to remoteDB", err);
    })
    .on("active", info => {
      console.log("replication resumed", info);
      req.app.replication = "on";
    })
    .on("paused", info => {
      console.log("replication paused", info);
    })
    .on("denied", err => {
      console.log("remote server denied replicaiton", err);
      req.app.replication = "error";
      helpers.emit_to_client(req.app.io, 'message', 'A deny error has occured during replication. Please restart server.');

    })
    .on("complete", result => {
      console.log("two-way replication completed", result);
      req.app.set("replication", "off");
      res.redirect("/patients");
      helpers.emit_to_client(req.app.io, 'message', 'Replication with Server Completed!');

    });
  setTimeout(function() {
    res.redirect("/patients");
  }, 1000);
};

module.exports.replicate_users = (req, res) => {
  var udb = req.app.udb;
  udb
    .sync(remoteUDB, {
      live: false
    })
    .on('change', info => {
      console.log('Replication Progress', helpers.getProgress(info.pending));
    })
    .on("complete", results => {
      console.log(results);
      req.app.set("replication", "off");
      res.redirect("/admin");
      helpers.emit_to_client(req.app.io, 'message', 'Replication with Server Completed!');
    })
    .on("error", err => {
      console.log("error in replication to remoteDB", err);
      req.app.set("replication", "error");
    });
};

// no var so suser can be deleted after used
suser = {
  _id: "la23ks45jf76",
  type: "user",
  user_name: "test",
  last_name: "tester"
};
