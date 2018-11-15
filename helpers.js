const os = require("os");
const path = require("path");
const domain = require("domain");
const express = require("express");
const app = express();
const http = require('http').Server(app);
// var io = require('socket.io')(http);
const socket = require('socket.io');



var pendingMax = 0;


function getProgress(pending, batch_size) {
  var progress;
  console.log(pending);
    progress = pending;
 
  return progress;
}


function per_page(count, perPage) {
    if (count < 500){ return count} else{
        return (500)
        }
    }
    
    class DBINFO {
        constructor(obj) {
          this.test = {};
          this.info = {};
          this.indexes = {};
        }
      }
      
      class local_system {
        constructor(obj) {
          this.uptime = {};
          this.homedir = os.homedir();
          this.freemem = os.freemem();
          this.online = {};
          this.networkInterfaces = os.networkInterfaces;
          this.dir = __dirname;
          this.domain = domain.members;
        }
      }

//currently using non-JSON data. Also only supporting 'message' type at this time.
function emit_to_client(io, type, data) {
  type = 'message';
  console.log(typeof(app.socket));
  io.emit(type, data);
  console.log('emit to client', type + data);
}

module.exports = {
    DBINFO,
    local_system,
    per_page,
    getProgress,
    emit_to_client,
}