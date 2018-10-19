//kickass example of working with pouchdb, updated for ES6.
//index.js matches with index.html
// pouchdb = require('pouchdb')

// Destroy the database before doing anything, because I want 
// you to see the same thing if you reload.
// Ignore the man behind the curtain!

new PouchDB('sample').destroy().then(function () {
  return new PouchDB('sample');
}).then(function (db) {
  //
  // IMPORTANT CODE STARTS HERE
  //
  db.put({_id: 'charlie', age: 21}).then(function () {
    return db.get('charlie');
  }).then(function (charlie) {
    document.getElementById('display').innerHTML = 'Charlie is how old? ' + JSON.stringify(charlie);
    // increment Charlie's age
    charlie.age++;
    return db.put(charlie);
  }).then(function () {
    return db.get('charlie');
  }).then(function (charlie) {
    document.getElementById('display').innerHTML += '\nCharlie is how old? ' + JSON.stringify(charlie);
    // increment Charlie's age again
    charlie.age++;
    return db.put(charlie);
  }).then(function () {
    return db.get('charlie');
  }).then(function (charlie) {
    document.getElementById('display').innerHTML += '\nCharlie is how old? ' + JSON.stringify(charlie);
  }).catch(function (err) {
    console.log(err);
  });
  //
  // IMPORTANT CODE ENDS HERE
  //
});