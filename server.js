'use strict';

//Add Express
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//Add middleware to parse requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//Arrays for storing users and files
var usersTable = [];
var filesTable = [];

//User constructor
function User(userName, hostName, connSpeed) {
	this.userName = userName;
	this.hostName = hostName;
	this.connSpeed = connSpeed;
};

//File constructor
function File(fileName, description) {
	this.fileName = fileName;
	this.description = description;
};

//Function to print the users table
function printUsersTable() {
	console.log('Username, Hostname, Connection Speed');
	for(var i = 0; i < usersTable.length; i++){
		console.log('User ' + i + ': ' + usersTable[i].userName + ', ' + usersTable[i].hostName + ', ' + usersTable[i].connSpeed);
	}
};

//Function to print the files table
function printFilesTable() {
	console.log('Filename, Description');
	for(var i = 0; i < usersTable.length; i++){
		console.log('File ' + i + ': ' + filesTable[i].fileName + ', ' + filesTable[i].description);
	}
};

//Connect to client, store user and file information
app.get('/', function (req, res) {
   
   console.log('Client has joined');

   //Store the username, hostname, and connection speed
   // var userName = req.body.userName;
   // var hostName = req.body.hostName;
   // var connSpeed = req.body.connSpeed;
   // var user = new User(userName, hostName, connSpeed);
   // usersTable.push(user);

	//TESTING USER AND FILE TABLES
   var user = new User('un', 'hn', 'cs');
   var file = new File('fn', 'd');
   usersTable.push(user);
   filesTable.push(file);
   printUsersTable();
   printFilesTable();

   //Send response back to client
   res.send('Connected');
   
})


//Open up server
var server = app.listen(6548, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log('Server listening at %s:%s', host, port);
})