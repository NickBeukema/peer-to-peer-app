'use strict';

var ipc = require('ipc');
var remote = require('remote');
var Tray = remote.require('tray');
var Menu = remote.require('menu');
var path = require('path');

var net = require('net');

ipc.send('getPort');
ipc.on('receivePort', function (port) {

  connectButton.addEventListener('click', function () {
    var hostServerAddress = hostServerInput.value;
    console.log(hostServerAddress);
    ipc.send('connect', hostServerAddress);
  });

  setTimeout(function () {
    client.list("/", function (err, res) {
      if (err) {
        console.log(err);
        return;
      }

      console.log(res);
    });

  }, 100);

});

// var server = require("./js/ftps").server({port: port});
// var client = require("./js/ftpc").client({port: port});
document.getElementById("connect").addEventListener("click", function(event){
  console.log("!!!");
});