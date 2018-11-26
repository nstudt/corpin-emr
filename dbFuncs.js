const PouchDB = require("pouchdb");
const express = require("express");
const app = express();
const pmodel = require("@models/patientModel");
const bodyParser = require("body-parser");
var dbname = app.get('dbname');

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

function initialize_udb(udb){
  admin = {
    _id: "admin",
    type: "user",
    user_name: "admin",
    last_name: "administrator",
    password: "password"
  };
  console.log('initializing udb');
  return new Promise((resolve, reject) => {
    udb.put(admin)
    .then((result) => {
      console.log(result);
      return build_index2(udb)
    }).then((result) => {
      console.log(result)
      return buildUsersFindIndex(udb)
    }).then((result) => {
      console.log('user find index complete', result)
    }).catch((err) => {
      console.log(err)
    })
  });
}

function get_dbinfo(db) {
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
function addVisitId(db, p_id, v_id, v_date) {
  return new Promise((resolve, reject) => {
    return db.get(p_id)
      .then(function(doc) {
        if (!doc.visit_ids){doc.visit_ids = []} //needed for old record compatability
        patient = new pmodel.Patient(doc)
        patient.visit_ids.push(v_id);
        patient.last_visit = v_date;
        return db.put(patient)
          .then(result => {
            resolve(result);
          })
          .catch(err => {
            console.log("error in addVisitID", err);
            reject(err);
          });
      });
  });
}

//appends medication to patienet.medications array
//this is close to a duplication of add_visits. 
//Look at abstracting both functions into one.
function add_medication(db, p_id, med) {
  return new Promise((resolve, reject) => {
    return db.get(p_id)
    .then((doc) => {
      patient = new pmodel.Patient(doc)
      patient.medications.push(med);
      return db.put(patient)
            .then(result => {
              resolve(console.log(result));
            })
            .catch(err => {
              console.log("error in addVisitID", err);
              reject(err);
            });
    })
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
        resolve(result);
      })
      .catch(err => {
        console.log("error in db build query", err);
        reject(err);
      });
  });
}

function build_index2(udb) {
  return new Promise((resolve, reject) => {
    return udb
      .put(ddoc2)
      .then(result => {
        resolve(result);
      })
      .catch(err => {
        console.log("error in udb build query", err);
        reject(err);
      });
  });
}
//TODO: is this index optimized?
function buildPatientsFindIndex(db) {
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
function buildUsersFindIndex(db) {
  return new Promise((resolve, reject) => {
    return db
      .createIndex({
        index: {
          name: ["users"],
          ddoc: ["users"],
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

function prep_db(db, dbn) {
  try {
    db = new PouchDB(dbn);
    console.log('db obj created');
    return db;
  } catch (err) {
    console.log(`error creating ${dbname} in prep`);
    return false;
  }
}

function prep_udb(udb, dbn) {
  try {
    udb = new PouchDB(dbn);
    console.log('db obj created');
    return udb;
  } catch (err) {
    console.log('error creating udb in prep', err);
    return false;
  }
}
//pass the db object and name of view eg: 'encounters/by_type (gets all encounters)'
function dbQuery(db, q, opts) {
  return new Promise((resolve, reject) => {
    return db
      .query(q)
      .then(response => {
        console.log('query response: ',response.rows)
        resolve(response.rows);
      })
      .catch(err => {
        console.log(`error in dbQuery: ${q} ${err} `);
        reject(err);
      });
  });
}

//abstracted without validation. Ensure correct body is passed in
function create(db, body) {
  return new Promise((resolve, reject) => {
    return db.put(body)
    .then(result => {
      return db.get(result.id, { include_docs: true }) //verify write
      .then(doc => {
          resolve(doc);
        })
        .catch(err => {
          console.log("error in dbFuncs.create", err);
          reject(err)
        });
    });
  });
}

//uses map reduce query
function get_one(db, _id) {
  return new Promise((resolve, reject) => {
    return db.get(_id)
    .then((doc) => {
        resolve(doc)
    }).catch((err) => {
        console.log(err);
        reject(err);
    });
});
}

//uses mango
function find_one(db, last_name) {
  return new Promise((resolve, reject) => {
  return db.find({
    selector: {
      $and: [
        {last_name: { '$eq': last_name }},
      ]
    }
  }).then((doc) => {
    console.log(doc)
    resolve(doc)
  }).catch((err) => {
    console.log('error in find_one ', err)
    reject(err)
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

function makeVisits(db) {
  return new Promise((resolve, reject) => {
    db.bulkDocs(sample_visits, () => {})
      .then(result => {
        console.log(result.rows);
        resolve(result);
      })
      .catch(err => {
        console.log("error makeVisits", err);
        reject(err);
      });
  });
}

function create_sample_user(udb, obj) {
  return new Promise((resolve, reject) => {
    return udb.put(obj)
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

function put_attachment(db, id, fName, rev, data, type) {
  return new Promise((resolve, reject) => {
    db.putAttachment(id, fName, rev, data, type)
    .then(result => {
      console.log(result)
      resolve(result)    
    })
    .catch(err => {
      console.log('error during file upload', err);
      reject(err)
    });
  });
  
}

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
  buildPatientsFindIndex,
  buildUsersFindIndex,
  prep_db,
  erase_indexes,
  prep_udb,
  get_dbinfo,
  get_one,
  put_attachment,
  find_one,
  add_medication,
  initialize_udb,

};
