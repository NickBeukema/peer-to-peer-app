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
	console.log('\nUsers Table:');
	for(var i = 0; i < usersTable.length; i++){
		console.log('User ' + i + ': ' + usersTable[i].userName + ', ' + usersTable[i].hostName + ', ' + usersTable[i].connSpeed);
	}
};

//Function to print the files table
function printFilesTable() {
	console.log('\nFiles Table:');
	for(var i = 0; i < filesTable.length; i++){
		console.log('File ' + i + ': ' + filesTable[i].fileName + ', ' + filesTable[i].description);
	}
};


//Allow client to connect, store user and file information
app.post('/register', function(req, res) {

   //Store the username, hostname, and connection speed
   var userName = req.body.userName;
   var hostName = req.body.hostName;
   var connSpeed = req.body.connSpeed;

   //If client didn't send the required information, respond with missing info
   if(userName == undefined){
      res.json('Missing username');
      console.log('\nClient failed to join');
      return;
   }
   else if(hostName == undefined){
      res.json('Missing hostname');
      console.log('\nClient failed to join');
      return;
   }
   else if(connSpeed == undefined){
      res.json('Missing connection speed');
      console.log('\nClient failed to join');
      return;
   }

   //Else, let the client join
   console.log('\nClient ' + userName + ' has joined.')

   //Store the file names and descriptions
   // var fileNames = req.body.fileNames;
   // var descriptions = req.body.descriptions;

   var files = req.body.files;

   //Push userName, hostName, and connSpeed to users table
   var user = new User(userName, hostName, connSpeed);
   usersTable.push(user);

   //Push files and descriptions to files table
   // for(var i = 0; i < fileNames.length; i++){
   //    var file = new File(fileNames[i], descriptions[i]);
   //    filesTable.push(file);
   // }

   for(var i = 0; i < files.length; i++){
      var file = new File(files[i].filename, files[i].description);
      filesTable.push(file);
   }

   //Print Users and Files tables to console
   printUsersTable();
   printFilesTable();

   //Send response back to client
   res.json('Connected');

})


//Disconnect from client
app.post('/disconnect', function (req, res) {

   //Set the username, hostname, and connection speed
   var userName = req.body.userName;
   var hostName = req.body.hostName;
   var connSpeed = req.body.connSpeed;
   var fileNames = req.body.fileNames;
   var descriptions = req.body.descriptions;

   //Boolean to tell if user was found
   var foundUser = false;

   //Remove username, hostname, and connection speed
   for(var i = 0; i < usersTable.length; i++){
      if(userName == usersTable[i].userName && hostName == usersTable[i].hostName && connSpeed == usersTable[i].connSpeed){
         usersTable.splice(i, 1);
         foundUser = true;
         break;
      }
   }

   //Remove files associated with this user
   //DO WE NEED TO DO THIS STEP??
   if(foundUser){
      for(var i = 0; i < fileNames.length; i++){
         for(var j = 0; j < filesTable.length; j++){
            if(fileNames[i] == filesTable[j].fileName && descriptions[i] == filesTable[j].description){
               filesTable.splice(j, 1);
               j--;  //Account for splice in loop
               break;
            }
         }
      }
   }

   //If user was not found, respond with an error message
   if(foundUser == true){
      console.log('\nUser ' + userName + ' has disconnected.');
      res.json('Disconnected');
   }
   else{
      console.log('\nUser ' + userName + ' not found.');
      res.json('User not found');
   }

   printUsersTable();
   printFilesTable();

})


//Search and return file
app.get('/search', function (req, res) {
   
   console.log('Client has queried');
   
})


//Open up server
var server = app.listen(6548, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log('Server listening at %s:%s', host, port);
})
