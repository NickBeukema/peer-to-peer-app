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

function postToServer(baseUrl, uri, body, callback) {
  var options = {
    uri: uri,
    baseUrl: baseUrl,
    method: "POST",
    json: true,
    body: body
  };

  request(options, function (error, response, body) {
    if (error){
      console.error(error);
    } else if (response.statusCode === 200){
      callback(body);
    }
  });
}

function registerWithServer(tracker, body, callback) {
  var baseUrl = "http://" + tracker.address + ":" + tracker.port + "/";
  var uri = "/register";

  postToServer(baseUrl, uri, body, callback);
}

function uploadFilesToServer(tracker, body, callback) {
  var baseUrl = "http://" + tracker.address + ":" + tracker.port + "/";
  var uri = "/upload-files";

  postToServer(baseUrl, uri, body, callback);
}

function disconnectFromServer(tracker, user, callback) {
  var baseUrl = "http://" + tracker.address + ":" + tracker.port + "/";
  var uri = "/disconnect";

  var body = {
    username: user.username
  }

  postToServer(baseUrl, uri, body, callback);
}

function searchServer(tracker, username, keyword, callback){
  var baseUrl = "http://" + tracker.address + ":" + tracker.port + "/";
  var uri = "/search";

  var options = {
    uri: uri,
    baseUrl: baseUrl,
    method: "GET",
    json: true,
    qs: { "keyword": keyword, "username": username }
  };

  request(options, function(err, res, body){
    if (err){
      console.error(err);
    } else if (res.statusCode === 200){
      callback(body);
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

