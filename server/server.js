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
function File(filename, description, hostname, speed, owner) {
   this.filename = filename;
   this.description = description;
   this.hostname = hostname;
   this.speed = speed;
   this.owner = owner;
}

File.prototype = {
   toString: function(){
      return this.filename + ": " + this.description;
   }
};

function clearLine() {
  console.log('\n\n');
}

//Function to print the users table
function printUsersTable() {
   console.log('Users Table:');
   if(usersTable.length === 0) {
     console.log(' -- No registered users --');
   } else {
     for(var i = 0; i < usersTable.length; i++){
        console.log('User ' + i + ': ' + usersTable[i].username + ', ' + usersTable[i].hostname + ', ' + usersTable[i].connSpeed);
     }
   }

   clearLine();
}

//Function to print the files table
function printFilesTable() {
   console.log('Files Table:');
   if(filesTable.length === 0) {
     console.log(' -- No registered files --');
   } else {
     for(var i = 0; i < filesTable.length; i++){
        console.log('File ' + i + ': ' + filesTable[i].filename + ', ' + filesTable[i].description);
     }
   }
   clearLine();
}

function lookupUser(username) {
  return usersTable.find(function(user){ return user.username === username});
}


//Allow client to connect, store user and file information
app.post('/register', function(req, res) {

   //Store the username, hostname, and connection speed
   var username = req.body.username;
   var hostname = req.body.hostname;
   var connSpeed = req.body.connectionSpeed;

   //If client didn't send the required information, respond with missing info
   if(username === undefined){
      res.json('Missing username');
      console.log('Client failed to join');
      clearLine();
      return;
   }
   else if(hostname === undefined){
      res.json('Missing hostname');
      console.log('Client failed to join');
      clearLine();
      return;
   }
   else if(connSpeed === undefined){
      res.json('Missing connection speed');
      console.log('Client failed to join');
      clearLine();
      return;
   }

   //Else, let the client join
   console.log('Client ' + username + ' has joined.');
    clearLine();


   var user = lookupUser(username);
   // Check if user already exists, if they do, update their details
   // also clear out files for people who come back
   if(user) {
     user.hostname = hostname;
     user.connSpeed = connSpeed;

     filesTable = filesTable.filter(function(file){ return file.owner != username});
   } else {
     //Push username, hostname, and connSpeed to users table
     user = new User(username, hostname, connSpeed);
     usersTable.push(user);
   }


   //Print Users and Files tables to console
   printUsersTable();
   printFilesTable();

   //Send response back to client
   res.json({
      "status": "connected"
   });

});

app.post('/upload-files', function (req, res) {

  // Get username
  var user = lookupUser(req.body.username);

  if(!user) {
    res.json('User is not register, please register before uploading files');
    console.log('Username ' + username + ' not found.');
    clearLine();
    return;
  }

  // Array of files with filename and description fields
  var files = req.body.files;

  // Push files and descriptions to files table
  for(var i = 0; i < files.length; i++) {
    var foundFileIndex = filesTable.findIndex(function(file) { return file.owner == user.username && file.description == files[i].description });

    // If the file already exists, assume a description update
    if(foundFileIndex >= 0) {
      console.log("File found: " + files[i].filename);
      console.log("Updating file description: " + files[i].filename);

      filesTable[foundFileIndex].description = files[i].description;
    } else {
      console.log("Uploading file: " + files[i].filename);

      var file = new File(files[i].filename, files[i].description, user.hostname, user.connSpeed, user.username);
      filesTable.push(file);
    }

  }
  clearLine();

  //Print Users and Files tables to console
  printUsersTable();
  printFilesTable();

});

//Disconnect from client
app.post('/disconnect', function (req, res) {

  //Set the username, hostname, and connection speed
  var username = req.body.username;

  // Find user within the usersTable
  var userToRemove = lookupUser(username);

  // If the user existed in the table, begin disconnecting
  if(userToRemove) {

    // Remove user from usersTabler
    usersTable.splice(usersTable.indexOf(userToRemove),1);

    // Filter out all of the users file and assign it to the filesTable
    filesTable = filesTable.filter(function(file){ return file.owner != username});

    //If user was not found, respond with an error message
    console.log('\nUser ' + username + ' has disconnected.');
    res.json('Disconnected');
  } else {
    console.log('\nUser ' + username + ' not found.');
    res.json('User not found');
  }

  clearLine();

  printUsersTable();
  printFilesTable();

});


// Search and return file
app.get('/search', function (req, res) {

   var keyword = req.query.keyword;
   var username = req.query.username;
   console.log(username + ' searched for "' + keyword + '"');
   clearLine();

   var files = filesTable.filter(function(file){
      return file.description.includes(keyword) && file.owner !== username;
   });

   console.log("Search Results");
   files.forEach(function(file) {
     console.log(file)
   });

   clearLine();

   res.json(files);

});


//Open up server
var server = app.listen(6548, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log('Server listening at %s:%s', host, port);
   clearLine();
});
