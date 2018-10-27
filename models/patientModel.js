const uuidv4 = require("uuid/v4");
const PouchDB = require("pouchdb");
// var db = new PouchDB('patients');
("use strict");

class Vitals {
  constructor (obj) {
    this.added = new Date();
    this.patient_id = obj.patient_id,
    this.type = "vitals";
    this.height = obj.height;
    this.weight = obj.weight;
    this.blood_pressure = obj.blood_pressure;
    this.pulse = obj.pulse;
    this.temp = obj.temp;
  }
    
}
class Visits {
  constructor(obj) {
    this.type = "visit";
    if (!this._id) {
      this._id = uuidv4();
    } else {
      this._id = obj._id;
    }
    this.date = obj.date
    this.patient_id = obj.patient_id;
    this._rev = obj._rev;
    this._attachments = obj._attachments;
    this.subjective = obj.subjective;
    this.objective = obj.objective;
    this.assesment = obj.assesment;
    this.plan = obj.plan;
    this.vitals = obj.vitals;
  }
}


class Patient {
  constructor(obj) {
    if (!obj._id) {
      this._id = uuidv4();
    } else {
      this._id = obj._id;
    }
    this._attachments = obj._attachments;
    this._rev = obj._rev;
    this.type = "patient";
    this.last_name = obj.last_name;
    this.first_name = obj.first_name;
    this.middle_name = obj.middle_name;
    this.phone1 = obj.phone1;
    this.sex = obj.sex;
    this.dob = obj.dob;
    this.address = obj.address;
    this.purok = obj.purok;
    this.city = obj.city;
    this.province = obj.province;
    this.phil_health = obj.phil_health;
    this.blood_type = obj.blood_type;
    this.last_visit = obj.last_visit;
    this.visit_ids = obj.visit_ids; //array of encounter _id
    this.visits = obj.visits;
    this.files = obj.files; 
    this.allergies = obj.allergies;
    this.medications = obj.medications;
    this.height = obj.height;
    this.weight = obj.weight;
    this.blood_pressure = obj.blood_pressure;
    this.pulse = obj.pulse;
    this.temp = obj.temp;
    this.age = this.constructor.calculate_age(obj.dob);
    this.files_meta = obj.files_meta
   
  };
  static calculate_age(strDate) { 
    var dob= new Date(strDate);
    var diff_ms = Date.now() - dob.getTime();
    var age_dt = new Date(diff_ms); 
  
    return Math.abs(age_dt.getUTCFullYear() - 1970);
};

  //used for files
  static createUUID() {
    return uuidv4();
  };
  
  full_name() {
    return this.first_name + " " + this.last_name;
  };

 
  //only useed to create new patient, but same function as update
  save(db) {
    //todo: no idea how to return the response to the calling function
    // console.log('the id of new patient', this._id)
    db.put(this, function(err, response) {
      if (err) {
        return console.log("error in save", err);
      } else {
        console.log("successfully created ", response.id);
        return response;
      };
    });
  };
  //same function as save()
  update(db, doc) {
    db.put(doc, function(err, response) {
      if (err) {
        return console.log("error in save", err);
      } else {
        console.log("successfully created ", response.id);
        return response;
      }
    });
  };
  
}

var docs = [
  {
    _id: "a123456",
    type: "patient",
    last_name: "Alverez",
    first_name: "Tito",
    middle_name: "David",
    phone1: "0990 634 2737",
    sex: "M",
    dob: "1/10/80",
    address: "123 Street",
    purok: "Consolation",
    city: "Dapa",
    province: "Surigao dell Norte",
    phil_health: "ph-48593-89800",
    allergies: [
      
    ],
    medications:[
    
      "Ibuprofen "
    ],
    blood_type: "O+",
    height: 190,
    weight: 85,
    visit_ids: [
   
    ],
    
    last_visit: "8/20/2018"
    // files:[{
    //     attID: "bjdf1234598",
    //     fileName: "testfile.png",
    //     added: "20/10/2018"
    //   }],
  },
  {
    _id: "b123456",
    type: "patient",
    last_name: "Caminade",
    first_name: "Alma",
    middle_name: "Gean",
    phone1: "0997 235 1097",
    sex: "F",
    dob: "4/6/85",
    address: "",
    purok: "1",
    city: "Burgos",
    province: "Surigao dell Norte",
    phil_health: "ph-48593-39200",
    allergies: [
      "sulfa ",
      "Penicillin"
    ],
    medications:[
      "Atorvastatin",
      "Ibuprofen "
    ],
    blood_type: "O+",
    height: 160,
    weight: 45,
    visit_ids: [
      
    ],
    
    last_visit: "10/2/2018"
    // files:[{
    //     attID: "bjdf1234598",
    //     fileName: "testfile.png",
    //     added: "20/10/2018"
    //   }],
  },
  {
    _id: "c123456",
    type: "patient",
    last_name: "Brao",
    first_name: "Niza",
    middle_name: "L",
    phone1: "0908 222 1987",
    sex: "F",
    dob: "1/20/79",
    address: "Tourist Rd",
    purok: "5",
    city: "General Luna",
    province: "Surigao dell Norte",
    phil_health: "ph-46653-93000",
    allergies: [
      "sulfa ",
      "Penicillin"
    ],
    medications:[
      "Atorvastatin",
      "Ibuprofen "
    ],
    blood_type: "A-",
    height: 165,
    weight: 42,
    visit_ids: [
        
    ],
    
    last_visit: "9/28/2018"
    // files:[{
    //     attID: "bjdf1234598",
    //     fileName: "testfile.png",
    //     added: "20/10/2018"
    //   }],
  },
  {
    _id: "d123456",
    type: "patient",
    last_name: "Inson",
    first_name: "Maricar",
    middle_name: "C",
    phone1: "0998 123 4567",
    sex: "M",
    dob: "12/15/81",
    address: "Sto Nino Street",
    purok: "9",
    city: "Dapa",
    province: "Surigao dell Norte",
    phil_health: "ph-48593-88900",
    allergies: [
      "sulfa ",
      "Penicillin"
    ],
    medications:[
      "Ibuprofen "
    ],
    blood_type: "AB-",
    height: 150,
    weight: 42,
    visit_ids: [
        
    ],
    
    last_visit: "9/2/2018"
    // files:[{
    //     attID: "bjdf1234598",
    //     fileName: "testfile.png",
    //     added: "20/10/2018"
    //   }],
  }
 
];

function samplePatients(db) {
  console.log("in sampleData");
  db.bulkDocs(docs, () => {})
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.log("error creating bulkDocs", err);
    });
}
module.exports = {
  Patient,
  samplePatients,
  Vitals,
  Visits
  // getAllDocs,
  // getDoc
};
