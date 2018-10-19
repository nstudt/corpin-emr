Handling the patient:
Lookup name from database
Create patient from model
(patient can now be passed around)
Send patient to view
Allow vitals
If encounter, send patient to SOAP
Update if changed



There are a lot of files in this structure that are not used, so use this to guide like a requirements.txt.
General guidelines: keep the business logic out of the client as much as possible to allow us to easily switch presntation layer if required.
OOP and Functionl js only. No procedural programming. Break up the tasks into functional models (find-patient.js etc)
Mocha testing.
Libraries are okay, but no frameworks unless absolutely necessary.
Use js instead of jquery.
Need inspiration: https://vanilla-js.com
couch.js - sample couchdb code that uses ejs for templating
/views/copuch.hbs - template.
/views/<partials> tbd, but we do need to split up everything into templates, once we figure out how that works in electron
/server
/models - still working on this. Models will serve two purposes: (class/contructors may work, but seem limiting, because the data they contain are not easily extracted. The purpose of models here is really to provide a database schema)
    1: provide a basis for database initialization <abtracted function gets json/model and creates a definition in the db. blood_type is a good example>
    2: for future reference: may be used for easy change management to the data structure, or for in-memory lists etc.
pillow.js - couch hard: use a pillow. Need to test all this code out, but should come in handy for production to keep the dbs work seperate from the client.
/css/w3.css is currently (10/2018) the prefered style.

Couchdb guidlines:
It maybe schema-less, but not for this app. Use models and predefine queries and views.
When at all possible, put all the db logic in the db.
Couchdb for the server(s) and pouchdb for the clients.
Docker-couchdb is stable. Servers will be configured with the docker-couchdb container.

The application consists of 3 parts (only Corpin EMR is included here)
1) Corpin EMR: An offline first applcation with peer replicaiton. Corpin EMR matinains electronic medical records for easy lookup by the physician.
2) Corpin SOPA Notes: Uses the Corpin-EMR engine, but is used for physician patient encounter, to quickly document the encounter using medical SOAP methodolgy. SOAP is written to EMR as a side-effect, but will not be included in the initial version of EMR.
3) Corpin Rx: In house pharmacy madule that also uses the EMR database for alergies and writes prescription history to the patient data.

Client-side requirements:
(Corpin EMR is an offline-first applicaiton, with persistent local data and peer replication)
Electron
Express
Pouchdb
w3.css
ejs templating (breaking the no-framework rule, but what else can we use?)

Server:
The server-side serves two purposes:
1) Hosts couchdb, which is self-contained (inside docker). (all dbs are masters)
2) Provides a relection of the client code for remote access from any browser, which is fronted by a REST API.
