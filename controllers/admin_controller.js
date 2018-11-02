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
var dbname = "patients";
var db = new PouchDB(dbname);
var udb_name = "userdb";
var udb = new PouchDB(udb_name);
const umodel = require("@models/userModel");
const pmodel = require("@models/patientModel");

//DO NOT CHANGE THIS - REQUIRED TO RUN BOOTSTRAP LOCALLY
// app.use(express.static(__dirname + "../"));
// // app.engine('handlebars', exphbs({defaultLayout: 'main'}));
// app.set("view engine", "hbs");
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// hbs.registerPartials("../views/partials");
// app.use(session({secret: 'sss'}));
var sess;


var system = new helpers.local_system();

var dbinfo = new helpers.DBINFO();

("use strict");
//todo - move dbname to .config
// var HOST = "http://admin:Sdfg@345@52.74.45.66:5984/patients";
var remoteDB = new PouchDB('http://52.74.45.66:5984/patients');
// var remoteDB = new PouchDB("http://192.168.0.180:2000/patients");
// var remoteUDB = new PouchDB("http://192.168.0.180:2000/userdb");


module.exports.toggle_repl = (req, res) => {
  console.log('got data from navbar click', req.body)
  res.send('badge badge-light');

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
  db.destroy()
    .then(response => {
      console.log("db.destroy", response);
    })
    .then(() => {
      udb.destroy()
        .then(response => {
          console.log("db destroy", response);
          res.redirect('/admin');
        })
        .catch(err => {
          console.log("error during destroy", err);
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
    res.redirect('/admin');
    });
  
};

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
      live: true,
      retry: true,
      back_off_function: function(delay) {
        console.log("backoff delay: ", delay);
        if (delay === 0) {
          return 1000;
        }
        return delay * 3;
      },
      timeout: 5000,
      batch_size: 50
    })
    .on("complete", result => {
      console.log(" pull relication result", result);
      sync.cancel();
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
      timeout: 5000,
      batch_size: 50
    })
    .on("complete", result => {
      console.log(" pull relication result", result);
      app.set('replication','on');
    })
    .on("denied", err => {
      console.log("deny happened during pull of patients from remote: ", err);
      app.set('replication','error');
    })
    .on("error", err => {
      console.log("error during pull replcation", err);
      app.set('replication','error');
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

  db.sync(remoteDB, {
    live: false,
    retry: true,
      back_off_function: function(delay) {
        console.log("backoff delay: ", delay);
        if (delay === 0) {
          return 1000;
        }
        return delay * 3;
      },
      timeout: 5000,
      batch_size: 50
  })
    .on("change", change => {
      console.log("replication triggered", change);
    })
    .on("error", err => {
      req.replication = "error";
      console.log("error in replication to remoteDB", err);
    })
    .on("active", () => {
      console.log("replication resumed");
      req.replication = "on";
    })
    .on("paused", () => {
      console.log("replication paused");
    })
    .on("denied", err => {
      console.log("remote server denied replicaiton", err);
      req.replication = "error";
    })
    .on("complete", result => {
      console.log("two-way replication completed", result);
    });
  var ProgressBar = require("progress");
  var bar = new ProgressBar(":bar", { total: 20 });
  var timer = setInterval(function() {
    bar.tick();
    if (bar.complete) {
      console.log("\ncomplete\n");
      clearInterval(timer);
    }
  }, 100);
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
