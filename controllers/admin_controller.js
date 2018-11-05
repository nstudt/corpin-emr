const os = require("os");
const path = require("path");
const domain = require("domain");
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
var db = new PouchDB(dbname);
const udb_name = "userdb";
var udb = new PouchDB(udb_name);
const umodel = require("@models/userModel");
const pmodel = require("@models/patientModel");
const batch_size = 100;    // replication
const timeout = 5000; //replication

var system = new helpers.local_system();
var dbinfo = new helpers.DBINFO();

("use strict");
// var HOST = "http://admin:Sdfg@345@52.74.45.66:5984/patients";
// var remoteDB = new PouchDB('http://52.74.45.66:5984/patients');
var remoteDB = new PouchDB("http://192.168.0.180:2000/patients");
// var remoteUDB = new PouchDB("http://192.168.0.180:2000/userdb");


module.exports.toggle_repl = (req, res) => {
  repl_state = req.app.get('replication')
  res.send(reapl_sate);
  };

module.exports.render_admin = (req, res) => {
  if (!dbinfo) {
    dbinfo = new DBINFO();
  }
  system.uptime = os.uptime();
  return dbFuncs.get_dbinfo(dbinfo)
  .then((info) => {
    console.log(info)
    res.render("admin", {
        // indexes: dbinfo.indexes.indexes,
        info: info,
        remoteDB: remoteDB,
        // remoteUDB: remoteUDB,
        system: system,
        replication: req.replication
      });
      
  });
}

module.exports.create_db = (req, res) => {
  console.log("creating fresh db");
  db = new PouchDB(dbname);
  console.log(`created ${dbname}`);
  udb = new PouchDB(udb_name);
  console.log(`created ${udb_name}`);
  res.redirect("/admin");
};

module.exports.delete_db = (req, res) => {
  return db.destroy()
    .then(response => {
      console.log("db.destroy", response);
    })
    .then(() => {
      return udb.destroy()
        .then(response => {
          console.log("db destroy", response);
          res.redirect('/admin');
        })
        .catch(err => {
          console.log("error during destroy", err);
          res.redirect('/admin');
        });
    });
};
module.exports.sample_data = (req, res) => {
  console.log("creating samples");
  if (!db) {
    db = dbFuncs.prep_db(dbname);
  }
     pmodel.samplePatients(db)
      return dbFuncs.makeVisits(db)
    .then(() => {
      return dbFuncs.create_sample_user(udb, suser)
    }).then((result) => {
      console.log('result of create_sample_user', result)
      delete suser;
      res.redirect("/admin");
    }).catch((err) => {
console.log('error in sample_data', err)
    });
};

module.exports.build_index = (req, res) => {
  console.log("building query");
  if (!db) {
    db = dbFuncs.prep_db();
  }
  udb = new PouchDB(udb_name);
  dbFuncs.build_index(db).then((result) => {
    console.log('result of build_index(db)', result)
      dbFuncs.build_index2(udb)
    }).then((result) => {
      console.log('result of build_index(udb)', result)
      dbFuncs.dbQuery(db, "index/visits", "a123456");
    }).then(() => {
      dbFuncs.dbQuery(db, "index/patients_only");
    }).then(() => {
      dbFuncs.dbQuery(udb, "index2/users_only");
    }).then(() => {
      res.redirect("/patients")
    }).then(() => {
      udb.allDocs().then(docs => {
        console.log("usb data: ", docs.rows);
      }).catch(err => {
        console.log("error in setting/buildQuery", err);
    });
    });
  }
  

module.exports.build_find_indexes = (req, res) => {
  if (!db) {
    db = dbFuncs.prep_db();
  }
  return dbFuncs.buildPatientsFindIndexes(db)
  .then((result) => {
    console.log("from build_find_indexes", result);
    res.redirect("/admin");
  }).catch((err) => {
    console.log('from build_find_indexes',err);
  });
  };

module.exports.replicate_from_remote = (req, res) => {
  if (!db) {
    db = dbFuncs.prep_db();
    console.log("new db obj created");
  }
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
      timeout: timeout,
      batch_size: batch_size,
    })
    .on("complete", result => {
      console.log(" pull relication result", result);
      console.log("stopped replication after completion");
    })
    .on("denied", err => {
      console.log("deny happened during pull of patients from remote: ", err);
    })
    .on("error", err => {
      console.log("error during pull replcation", err);
    });
  setTimeout(function() {
    res.redirect("/patients");
  }, 2000);
};

module.exports.replicate_to_remote = (req, res) => {
  if (!db) {
    db = dbFuncs.prep_db();
    console.log("new db obj created");
  }
  console.log("starting replication");
  app.set('replication','on');
  console.log(app.get('replication'));
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
      timeout: timeout,
      batch_size: batch_size
    })
    .on("complete", result => {
      console.log(" pull relication result", result);
      req.app.set('replication','on');
    })
    .on("denied", err => {
      console.log("deny happened during pull of patients from remote: ", err);
      req.app.set('replication','error');
    })
    .on("error", err => {
      console.log("error during pull replcation", err);
      req.app.set('replication','error');
    });
  setTimeout(function() {
    res.redirect("/patients");
  }, 2000);
};

module.exports.replicate_patients = (req, res) => {
  if (!db) {
    db = dbFuncs.prep_db();
    console.log();
  }
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
    .on("change", info => {
      console.log('Replication Progress', helpers.getProgress(info.pending, batch_size));
      console.log("replication triggered", info);
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
    })
    .on("complete", result => {
      console.log("two-way replication completed", result);
    });
  setTimeout(function() {
    res.redirect("/patients");
  }, 1000);
};

module.exports.replicate_users = (req, res) => {
  if (!udb) {
    udb = dbFuncs.prep_udb();
    console.log();
  }
  udb
    .sync(remoteDB, {
      live: false
    })
    .on("complete", results => {
      console.log(results);
    })
    .on("error", err => {
      console.log("error in replication to remoteDB", err);
    });
  setTimeout(res.redirect("/patients"), 3000);
};

// no var so suser can be deleted after used
suser = {
  _id: "la23ks45jf76",
  type: "user",
  user_name: "test",
  last_name: "tester"
};
