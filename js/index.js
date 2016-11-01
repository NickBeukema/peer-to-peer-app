'use strict';

var ipc = require('ipc');
var remote = require('remote');
var Tray = remote.require('tray');
var Menu = remote.require('menu');
var path = require('path');

var net = require('net');

var hostServerInput = document.querySelector('input#host-address');
var connectButton = document.querySelector('button#connect');

connectButton.addEventListener('click', function(){
  var hostServerAddress = hostServerInput.value;
  console.log(hostServerAddress);
  ipc.send('connect', hostServerAddress);
});

var server = require("./js/Server").server();
var client = require("./js/Client").client();

setTimeout(function(){
  client.list("/", function(err, res){
    if (err){
      console.log(err);
      return;
    }

    console.log(res);
  });

}, 100);

