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
}

//File constructor
function File(fileName, description) {
   this.fileName = fileName;
   this.description = description;
}

//Function to print the users table
function printUsersTable() {
   console.log('\nUsers Table:');
   for(var i = 0; i < usersTable.length; i++){
      console.log('User ' + i + ': ' + usersTable[i].userName + ', ' + usersTable[i].hostName + ', ' + usersTable[i].connSpeed);
   }
}

//Function to print the files table
function printFilesTable() {
   console.log('\nFiles Table:');
   for(var i = 0; i < filesTable.length; i++){
      console.log('File ' + i + ': ' + filesTable[i].fileName + ', ' + filesTable[i].description);
   }
}


//Allow client to connect, store user and file information
app.post('/register', function(req, res) {
   //console.log("hit");

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

   //Array of files with filename and description fields
   var files = req.body.files;

   //Push userName, hostName, and connSpeed to users table
   var user = new User(userName, hostName, connSpeed);
   usersTable.push(user);

   //Push files and descriptions to files table
   for(var i = 0; i < files.length; i++){
      var file = new File(files[i].filename, files[i].description);
      filesTable.push(file);
   }

   //Print Users and Files tables to console
   printUsersTable();
   printFilesTable();

   //Send response back to client
   res.json('Connected');

});


//Disconnect from client
app.post('/disconnect', function (req, res) {

   //Set the username, hostname, and connection speed
   var userName = req.body.userName;
   var hostName = req.body.hostName;
   var connSpeed = req.body.connSpeed;

   //Array of files with filename and description fields
   var files = req.body.files;

   //Boolean to tell if user was found
   var foundUser = false;
   var i;
   //Remove username, hostname, and connection speed
   for(i = 0; i < usersTable.length; i++){
      if(userName == usersTable[i].userName && hostName == usersTable[i].hostName && connSpeed == usersTable[i].connSpeed){
         usersTable.splice(i, 1);
         foundUser = true;
         break;
      }
   }

   //Remove files associated with user
   //If user copies a file from its peer, then leaves, this might try to delete that file from files table...
   if(foundUser){
      for(i = 0; i < files.length; i++){
         for(var j = 0; j < filesTable.length; j++){
            if(files[i].filename == filesTable[j].fileName && files[i].description == filesTable[j].description){
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

});


//Search and return file
app.get('/search', function (req, res) {

   //Set query string
   var keyword = req.body.keyword
   console.log('Client has queried');

   //Array of files that contain keyword
   var fileList;

   //Search filenames and descriptions for keyword
   for(var i = 0; i < filesTable.length; i++){
      if(filesTable[i].fileName.includes(keyword) || filesTable[i].description.includes(keyword)){
         fileList.push(filesTable[i]);
         console.log('Found a file');
      }
   }

   res.json(fileList);

});


//Open up server
var server = app.listen(6548, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log('Server listening at %s:%s', host, port);
});