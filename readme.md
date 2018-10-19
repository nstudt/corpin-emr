# Corpin EMR
## Responsive Healthcare for the Philippines

(20 October 2018. This first commit is basically a backup. While the client is functional, I have not yet refactored the codebase. I do encourage anyone interested in offline EMR systems to follow the project, but probably better to wait for the refactor before testing)

Corpin EMR is an offline-first EMR applicaiton with a number of extensions to facilitate small clinics in the rural Philippines. All core features are vailable without and internet connection.

Corpin EMR was inspired by HospitalRun in that HospitalRun was intended to serve rural hospitals that had poor or no Internet connectons. The problem with HospitalRun however, was that (besides no working), the entire application was wound into Ember, so there's not chance of ever moving it forward. Corpin EMR uses pretty classic coding techniques, so it's easy to morph and seperate the portions of the MVC.

Corpin EMR is designed to work the way the local doctors do without making them think about the technology. If a physician is in the clinic, then the applicaiton will find any wireless printers and automatically sync to the Cloud. When the doctor is out in the field without Internet, records and SOAP notes are always available.

### Features
- Secure ACL access to data (not yet implemented).
- Patient management. (CRUD)
- Encoded (digital) and scanned-paper records management.
- Medical SOAP notes accessed throught he View Patienets screen.
- Write Rx from the Plan section of SOAP notes (todo).
- Automatic Internet dedection and sync to Cloud Couchdb server.
- Multi-client support through master-master dbs support.
- Core ICD-10 and RxNorm databases for offline-lookup. (todo)
- Type ahead ICD-10 and RxNorm context entry during encouter.
- Obstetrics support through flagging of patient pregnancy.
- Integrated mode-b ultra-sound support. (todo)
- Patienet picture association. (todo)
- 

Coded using Node.js, Express and Handlbars for templating. I tried to keep this vanilla as possible, so no front-end frameworks are used.

Several design patterns are implemented in an attemnpt to keep business-logic out of the frontend.

Further, the entire client is intended to be wrapped in Electron for production, which is not yet implemented.

While NoSql does not require a schema, one has been implemented as models classes, for Patients, Users, Visits and Vitals. More will be added as functionality is increased.

### Design Notes
Server: Not completed. I'm looking to implement continuity between client and server code.
--Couchdb in the cloud: Acts as a direct-connect replicant of the client.
--The server also provides a REST interfce that allows direct browser access to the application.

Client: Functional.
--PouchDB: Most functions wrapped in dbFuncs, but a few still exist in Patients.js
--app.js is currently both the controller and view. One todo is to move seperate the routes and controllers into a classic MVS with objects.

### Getting Started
1. Clone
2. Run `npm install`.
3. `npm start debug`.
4. from the Admin menu, choose Wipe Data. Create Sample and then Build Index.

### Contributions
Uh.. Sure! This has been a solo effort so far, but if more competent coders want to get involved, I'd love the help.


