'use strict';

var ipc = require('ipc');
var remote = require('remote');
var Tray = remote.require('tray');
var Menu = remote.require('menu');
var path = require('path');

var net = require('net');
var request = require('request');

var hostServerAddress = null;
var hostPort = null;

function registerWithServer() {
  var body = {
    "userName": "James123",
    "hostName": "myHost",
    "connSpeed": "DSL",
    "files": [{"filename": "dd.txt", "description": "My file of the abcs"}, {"filename": "coffde.rb", "description": "My ruby code"}]
  };

  var baseUrl = "http://" + hostServerAddress + ":" + hostPort + "/";
  var uri = "/register";

  var options = {
    uri: uri,
    baseUrl: baseUrl,
    method: "POST",
    body: body,
    json: true
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body)
    }
  });
}

// Get port from CL arguments, or default 7710
ipc.send('getPort');
ipc.on('receivePort', function(port){

  var hostServerInput = document.querySelector('input#host-address');
  var hostPortInput = document.querySelector('input#host-port');
  var connectButton = document.querySelector('button#connect');

});
