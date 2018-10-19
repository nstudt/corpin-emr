class User {
  constructor() {
    if (!obj._id) {
      this._id = uuidv4();
    } else {
      this._id = obj._id;
    }
    
    if (!obj.created) {
      this.created = new Date();
    } else {
      this.created = obj.created;
    }

    this.last_name = obj.last_name;
    this.fist_name = obj.first_name;
    this.title = obj.title;
    this.phone1 = obj.phone1;
    this.user_name = obj.user_name;
    this.email = obj.email;
    this.roles = obj.roles;
    this.active = obj.active;
    this.password = obj.password;
    this.last_modified = obj.last_modified;
  }
}

class Roles {
  //not a db object. No _id required. This class is used to generate a static list for selecting user.roles.
  constructor() {
    this.admin = "Admin";
    this.physician = "Physician";
    this.receptionis = "Receptionist";
    this.nurse = "Nurse";
    this.staff = "Staff";
    this.service = "service";
  }
}

//privledges keeps the business logic out of the view layer. Define it here.
//not a db object
class Privledges {
  constructor() {
    this.db_read = ["admin", 'service', ];
    this.db_write = ["admin", 'service'];
    this.db_create = ["admin", 'service'];
    this.db_destroy = ["admin", 'service'];
    this.records_read = ["admin", "physician", "nurse", "recepionist"];
    this.records_write = ["admin", "physician", "nurse", "recepionist"];
    this.records_create = ["admin", "physician", "nurse", "recepionist"];
    this.patients.create = ["admin", "physician", "recepionist"];
    this.patients.edit = ["admin", "physician", "recepionist"];

  }
}
