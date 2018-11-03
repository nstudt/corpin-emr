const PouchDB = require("pouchdb");
var pmodel = require("./models/patientModel");
const bodyParser = require("body-parser");
var dbname = "patients";
var udb_name = "userdb";
var db;
("use strict");

// declare views
var ddoc2 = {
  _id: "_design/index2",
  views: {
    users_only: {
      map: function(doc) {
        if (doc.type == "user") {
          emit(doc._id);
        }
      }.toString()
    }
  }
};
// declare views
var ddoc1 = {
  _id: "_design/index",
  views: {
    visits: {
      map: function(doc) {
        if (doc.type == "visit") {
          emit(doc.patient_id);
        }
      }.toString()
    },
    patients_only: {
      map: function(doc) {
        if (doc.type == "patient") {
          emit([doc.last_name, doc._id]);
        }
      }.toString()
    }
  }
};
function get_dbinfo() {
  if (!db) {
    db = this.prep_db();
    console.log("from get_dbinfo: created db");
  }
  return new Promise((resolve, reject) => {
    return db.info()
    .then((result) => {
        resolve(result)
    }).catch((err) => {
        console.log(err);
        reject(err);
    });
});
}

//appends visit _id to patient record
//error 412 (missing _id), which is obviously there. No idea.
function addVisitId(db, p_id, v_id, v_date) {
  return new Promise((resolve, reject) => {
    return db
      .query("index/patients_only", { key: p_id, include_docs: true })
      .then(function(doc) {
        doc.rows[0].doc.visit_ids.push(v_id);
        doc.rows[0].doc.last_visit = v_date;
        db.put(doc)
          .then(result => {
            resolve(console.log(result));
          })
          .catch(err => {
            console.log("error in addVisitID", err);
          });
      });
  });
}

function erase_indexes(db) {
  try {
    db.getIndexes().then(result => {
      if (indexesResult.length > 0) {
        console.log("indexesResult", indexesResult);
        for (var index in indexesResult.indexes - 1) {
          db.deleteIndex(indexesResult.indexes[index + 1]);
          console.log("index deleted", result);
        }
      }
    });
  } catch (err) {
    console.log("error deleting index", err);
  }
}

function build_index(db) {
  return new Promise((resolve, reject) => {
    return db
      .put(ddoc1)
      .then(result => {
        resolve(console.log("secondary indexes built: ", result));
      })
      .catch(err => {
        console.log("error in build query", err);
      });
  });
}
function build_index2(udb) {
  return new Promise((resolve, reject) => {
    return udb
      .put(ddoc2)
      .then(result => {
        resolve(console.log("secondary indexes built: ", result));
      })
      .catch(err => {
        console.log("error in build query", err);
      });
  });
}
function prep_db() {
  try {
    console.log("db obj not exist");
    var db = new PouchDB(dbname);
    console.log("db obj created");
    return db;
  } catch (err) {
    console.log("error during db creation ", err);
    return false;
  }
}
function prep_udb() {
  try {
    console.log("db obj not exist");
    var udb = new PouchDB(udb_name);
    console.log("db obj created");
    return db;
  } catch (err) {
    console.log("error during db creation ", err);
    return false;
  }
}
//pass the db object and name of view eg: 'encounters/by_type (gets all encounters)'
function dbQuery(db, q, opts) {
  return new Promise((resolve, reject) => {
    return db
      .query(q, { key: opts, include_docs: true })
      .then(response => {
        //handle response
        resolve(console.log("dbQuery response: ", response.rows));
      })
      .catch(err => {
        console.log(`error in dbQuery: ${q} ${err} `);
      });
  });
}
function makeVisits(db) {
  return new Promise((resolve, reject) => {
    db.bulkDocs(sample_visits, () => {})
      .then(result => {
        resolve(console.log(result));
      })
      .catch(err => {
        console.log("error makeVisits", err);
      });
  });
}
//abstracted without validation. Ensure correct body is passed in
function create(db, body) {
  return new Promise((resolve, reject) => {
    db.put(body).then(result => {
      //display the doc just created
      db.get(result._id, { include_docs: true })
        .then(doc => {
          console.log(doc.rows);
        })
        .catch(err => {
          console.log("error in dbFuncs.create", err);
        });
    });
  });
}

function remove(db, _id) {
  return new Promise((resolve, reject) => {
    db.get(_id)
      .then(doc => {
        return db.remove(doc);
      })
      .then(result => {
        console.log(result);
        resolve(result);
      })
      .catch(err => {
        console.log("error diuring delete", err);
        reject(err);
      });
  });
}

function create_sample_user(udb, obj) {
  return new Promise((resolve, reject) => {
    return udb
      .put(obj)
      .then(result => {
        console.log("created sample user", result);
        resolve(result);
      })
      .catch(err => {
        console.log("error in creating sample user", err);
        reject(err);
      });
  });
}

//the calling function needs to be wrapped in a promise
function update(db, body) {
  return new Promise((resolve, reject) => {
    return db
      .get(body._id)
      .then(doc => {
        Object.assign(doc, body);
        db.put(doc).then(results => {
          resolve(results);
        });
      })
      .catch(err => {
        console.log("error in", err);
        reject(err);
      });
  });
}

//TODO: is this index optimized?
function buildPatientsFindIndexes(db) {
  return new Promise((resolve, reject) => {
    return db
      .createIndex({
        index: {
          name: ["patients"],
          ddoc: ["patients"],
          fields: ["last_name"]
        }
      })
      .then(result => {
        console.log(result);
        resolve(result);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

var sample_visits = [
  {
    _id: "0987fdsa",
    type: "visit",
    patient_id: "a123456",
    date: "20/9/2018",
    subjective: "test for subjective entry.",
    objective: "test for objective entry",
    assesment: "test for assement entry",
    plan:
      "test for plan. Can include subfields here like lab, medicaitons and followup.",
    vitals: {
      date: "",
      heigth: "180",
      weight: "80",
      blood_pressure: "140/80",
      pulse: "60",
      temp: "37"
    }
  },
  {
    _id: "87654fdsa",
    type: "visit",
    patient_id: "a123456",
    date: "1/9/2018",
    subjective: "test for subjective entry.",
    objective: "test for objective entry",
    assesment: "test for assement entry",
    plan:
      "test for plan. Can include subfields here like lab, medicaitons and followup.",
    vitals: {
      date: "",
      heigth: "180",
      weight: "81",
      blood_pressure: "160/70",
      pulse: "65",
      temp: "37.2"
    }
  },
  {
    _id: "33445566fdsa",
    type: "visit",
    patient_id: "b123456",
    date: "1/9/2018",
    subjective: "test for subjective entry.",
    objective: "test for objective entry",
    assesment: "test for assement entry",
    plan:
      "test for plan. Can include subfields here like lab, medicaitons and followup.",
    vitals: {
      date: "",
      heigth: "180",
      weight: "81",
      blood_pressure: "160/70",
      pulse: "65",
      temp: "37.2"
    }
  }
];

module.exports = {
  dbQuery,
  sample_visits,
  build_index,
  makeVisits,
  addVisitId,
  update,
  create,
  remove,
  create_sample_user,
  build_index2,
  buildPatientsFindIndexes,
  prep_db,
  erase_indexes,
  prep_udb,
  get_dbinfo
};
