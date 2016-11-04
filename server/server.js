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
function User(username, hostname, connSpeed) {
   this.username = username;
   this.hostname = hostname;
   this.connSpeed = connSpeed;
}


//File constructor
function File(filename, description, hostname, speed) {
   this.filename = filename;
   this.description = description;
   this.hostname = hostname;
   this.speed = speed;
}

File.prototype = {
   toString: function(){
      return this.filename + ": " + this.description;
   }
};

//Function to print the users table
function printUsersTable() {
   console.log('\nUsers Table:');
   for(var i = 0; i < usersTable.length; i++){
      console.log('User ' + i + ': ' + usersTable[i].username + ', ' + usersTable[i].hostname + ', ' + usersTable[i].connSpeed);
   }
}

//Function to print the files table
function printFilesTable() {
   console.log('\nFiles Table:');
   for(var i = 0; i < filesTable.length; i++){
      console.log('File ' + i + ': ' + filesTable[i].filename + ', ' + filesTable[i].description);
   }
}


//Allow client to connect, store user and file information
app.post('/register', function(req, res) {
   //console.log("hit");

   //Store the username, hostname, and connection speed
   var username = req.body.username;
   var hostname = req.body.hostname;
   var connSpeed = req.body.connectionSpeed;

   //If client didn't send the required information, respond with missing info
   if(username === undefined){
      res.json('Missing username');
      console.log('\nClient failed to join');
      return;
   }
   else if(hostname === undefined){
      res.json('Missing hostname');
      console.log('\nClient failed to join');
      return;
   }
   else if(connSpeed === undefined){
      res.json('Missing connection speed');
      console.log('\nClient failed to join');
      return;
   }

   //Else, let the client join
   console.log('\nClient ' + username + ' has joined.');

   //Array of files with filename and description fields
   var files = req.body.files;

   //Push username, hostname, and connSpeed to users table
   var user = new User(username, hostname, connSpeed);
   usersTable.push(user);

   //Push files and descriptions to files table
   for(var i = 0; i < files.length; i++){
      var file = new File(files[i].filename, files[i].description, hostname, connSpeed);
      filesTable.push(file);
   }

   //Print Users and Files tables to console
   printUsersTable();
   printFilesTable();

   //Send response back to client
   res.json({
      "status": "connected"
   });

});


//Disconnect from client
app.post('/disconnect', function (req, res) {

   //Set the username, hostname, and connection speed
   var username = req.body.username;
   var hostname = req.body.hostname;
   var connSpeed = req.body.connectionSpeed;

   //Array of files with filename and description fields
   var files = req.body.files;

   //Boolean to tell if user was found
   var foundUser = false;
   var i;
   //Remove username, hostname, and connection speed
   for(i = 0; i < usersTable.length; i++){
      if(username == usersTable[i].username && hostname == usersTable[i].hostname && connSpeed == usersTable[i].connSpeed){
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
            if(files[i].filename == filesTable[j].fileame && files[i].description == filesTable[j].description){
               filesTable.splice(j, 1);
               j--;  //Account for splice in loop
               break;
            }
         }
      }
   }

   //If user was not found, respond with an error message
   if(foundUser == true){
      console.log('\nUser ' + username + ' has disconnected.');
      res.json('Disconnected');
   }
   else{
      console.log('\nUser ' + username + ' not found.');
      res.json('User not found');
   }

   printUsersTable();
   printFilesTable();

});


//Search and return file
app.get('/search', function (req, res) {
   require('url').parse(req.url).query

   //Set query string
   //Supposedly using req.body is bad practice in .get
   //Postman doesn't even allow you to include a body when calling .get
   var keyword = JSON.parse(req.query.keyword);
   console.log('Client searched for ' + keyword);

   console.log(filesTable.filter(function(file){
      return file.description.includes(keyword);
   }))

   res.json(filesTable.filter(function(file){
      return file.description.includes(keyword);
   }))

});


//Open up server
var server = app.listen(6548, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log('Server listening at %s:%s', host, port);
});