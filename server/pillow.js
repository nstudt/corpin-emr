const URL = "http://10.8.155.103:5984"

function getDB(dbName) {
    return new Promise(function(resolve, reject) {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                resolve(JSON.parse(xhttp.responseText));
            } else if (this.status >= 400) {
                reject(this.status);
            }
        };

        xhttp.open("GET", URL + '/' + dbName, true);
        xhttp.send();
    });
}

function getDocument(dbName, docName) {
    return new Promise(function(resolve, reject) {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                resolve(JSON.parse(xhttp.responseText));
            } else if (this.status >= 400) {
                reject(this.status);
            }
        };

        xhttp.open("GET", URL + '/' + dbName + '/' + docName, true);
        xhttp.send();
    });
}

function getView(dbName, docName, viewName) {
    return new Promise(function(resolve, reject) {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                resolve(JSON.parse(xhttp.responseText));
            } else if (this.status >= 400) {
                reject(this.status);
            }
        };

        xhttp.open("GET", URL + '/' + dbName + '/_design/' + docName + '/_view/' + viewName, true);
        xhttp.send();
    });
}

function getDBList(dbName, docName) {
    return new Promise(function(resolve, reject) {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                resolve(JSON.parse(xhttp.responseText));
            } else if (this.status >= 400) {
                reject(this.status);
            }
        };

        xhttp.open("GET", URL + "/_all_dbs", true);
        xhttp.send();
    });
}


function createDB(dbName) {
    var req = new XMLHttpRequest();
    req.open("PUT", URL + "/" + dbName, true);
    req.setRequestHeader("Content-type", "application/json");

    req.send();
}

function updateDB(dbName, docName, data) {
    var req = new XMLHttpRequest();
    req.open("PUT", URL + '/' + dbName + '/' + docName, true);
    req.setRequestHeader("Content-type", "application/json");

    req.send(JSON.stringify(data));
}

function deleteDB(dbName) {
    var req = new XMLHttpRequest();
    req.open("DELETE", URL + "/" + dbName, true);
    req.setRequestHeader("Content-type", "application/json");

    req.send();
}

function deleteDoc(dbName, docName) {
    var req = new XMLHttpRequest();
    req.open("DELETE", URL + "/" + dbName + '/' + docName, true);
    req.setRequestHeader("Content-type", "application/json");

    req.send();
}

function addOne(a ,b){
    return (a+b);
}

//this is nodejs only
module.exports = {
    deleteDoc,
    deleteDB,
    addOne,


}