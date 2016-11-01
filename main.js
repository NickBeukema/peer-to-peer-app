'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');


var mainWindow = null;
var settingsWindow = null;

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        height: 1080,
        width: 1920
    });

    mainWindow.toggleDevTools();

    mainWindow.loadUrl('file://' + __dirname + '/index.html');
});

ipc.on('connect', function(event, data) {
});

ipc.on('close-main-window', function () {
    app.quit();
});
