'use strict';

var ipc = require('ipc');
var remote = require('remote');
var Tray = remote.require('tray');
var Menu = remote.require('menu');
var path = require('path');
var fs = require("fs");
var net = require('net');
var request = require('request');


var hostServerAddress = "127.0.0.1";
var hostPort = 6548;

function registerWithServer(tracker, body, callback) {

  var baseUrl = "http://" + tracker.address + ":" + tracker.port + "/";
  var uri = "/register";

  var options = {
    uri: uri,
    baseUrl: baseUrl,
    method: "POST",
    json: true,
    body: body
  };

  request(options, function (error, response, body) {
    if (error){
      console.log(error);
    }else if (response.statusCode === 200){

      callback(body);
      console.log(body);
    }
  });
}

function disconnectFromServer(tracker, user, callback) {
  var baseUrl = "http://" + tracker.address + ":" + tracker.port + "/";
  var uri = "/disconnect";

  var options = {
    uri: uri,
    baseUrl: baseUrl,
    method: "POST",
    json: true,
    body: { username: user.username }
  };

  request(options, function(error, response, body) {
    if (error) {
      console.log(error);
    } else if (response.statusCode === 200) {
      callback(body);
      console.log(body);
    }
  });

}

function searchServer(tracker, keyword, callback){
  var baseUrl = "http://" + tracker.address + ":" + tracker.port + "/";
  var uri = "/search";

  var options = {
    uri: uri,
    baseUrl: baseUrl,
    method: "GET",
    json: true,
    body: {"keyword": keyword}
  };

  request(options, function(err, res, body){
    if (err){
      console.log(err);
    } else if (res.statusCode === 200){
      callback(body);
    } else {

    }
  });
}

// Get port from CL arguments, or default 7710
ipc.send('getPort');
ipc.on('defaultPorts', function(ports){
  var hostServerInput = document.querySelector('input#host-address');
  var hostPortInput = document.querySelector('input#host-port');
  var connectButton = document.querySelector('button#connect');

});

