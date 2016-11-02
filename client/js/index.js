'use strict';

var ipc = require('ipc');
var remote = require('remote');
var Tray = remote.require('tray');
var Menu = remote.require('menu');
var path = require('path');

var net = require('net');

ipc.send('getPort');
ipc.on('receivePort', function(port){


  var hostServerInput = document.querySelector('input#host-address');
  var connectButton = document.querySelector('button#connect');

  connectButton.addEventListener('click', function(){
    var hostServerAddress = hostServerInput.value;
    console.log(hostServerAddress);
    ipc.send('connect', hostServerAddress);
  });

  var server = require("./js/Server").server({port: port});
  var client = require("./js/Client").client({port: port});

  setTimeout(function(){
    client.list("/", function(err, res){
      if (err){
        console.log(err);
        return;
      }

      console.log(res);
    });

  }, 100);

});
