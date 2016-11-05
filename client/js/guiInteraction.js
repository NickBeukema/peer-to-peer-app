var app = {};
var port = 7710;
var server = require("./js/ftps").server({port: port});
var client = require("./js/ftpc").client({port: port});

var trackerAddress = document.getElementById("tracker-address");
var trackerPort = document.getElementById("tracker-port");
var username = document.getElementById("username");
var hostname = document.getElementById("hostname");
var connectionSpeed = document.getElementById("speed");

var fs = require('fs');

function getFilesForUser(username, callback) {
  fs.readFile(username + '/filelist.json', 'utf8', function(err, fd) {
    if (err) { throw err; }

    callback(JSON.parse(fd));
  });
}

function uploadFiles(username) {
  var files = getFilesForUser(username, function(fileList){
    var body = {
      username: username,
      files: fileList.files
    };

    uploadFilesToServer(app.tracker, body, function(resp){
      console.log(resp);
    });
  });
}

var connect = document.getElementById("connect");
connect.addEventListener("click", function(event){
  var self = this;

  if(self.classList.contains("btn-danger")){
    self.classList.remove("btn-danger");

    //disconnect from server
    self.classList.add("btn-primary");
    self.innerText = "connect to tracker";

    disconnectFromServer(app.tracker, app.user, function(res){
      console.log(res);
    });
    return;
  }

  self.classList.add("btn-info");
  self.classList.remove("btn-primary");

  var tracker = {
    "address": trackerAddress.value || "127.0.0.1",
    "port": trackerPort.value || 6548
  };

  var name = username.value || "jack";


  var user = {
    "username": name,
    "hostname": hostname.value || "127.0.0.1",
    "connectionSpeed": connectionSpeed.value || "fiber"
  };

  this.innerText = "connecting to " + tracker.address + ":" + tracker.port;

  registerWithServer(tracker, user, function(res){
    console.log(res);
    if (res.status === "connected"){
      self.classList.remove("btn-info");
      self.classList.add("btn-success");
      setTimeout(function(){
        self.classList.add("btn-danger");
        self.classList.remove("btn-success");
        self.innerText = "disconnect";

      }, 500);
      self.innerText = "connected!";
      app.tracker = tracker;
      app.user = user;

      uploadFiles(user.username);
    }
  });
});

var search = document.getElementById("search-keyword");
search.addEventListener("keyup", function(event){
  if (event.keyCode === 13 || event.which === 13){
    console.log("Searching for '" + this.value + "'");
    searchServer(app.tracker, this.value, updateSearchResults);
  }
});

function downloadFile(hostname, filename, user) {
  console.log(hostname, filename, user);
}

function updateSearchResults(res){
  var html = "";
  console.log("Search results");
  var i = 1;
  res.forEach(function(file){
    html += "<tr><th scope='row'>" + i + "</th><td>" + file.speed + "</td><td>" + file.hostname + "<td>" + file.filename + "</td><td>" + file.description + "</td><td><button class='btn app-download-button' data-hostname='" + file.hostname + "' data-filename='" + file.filename + "'>Download</td></tr>";
    i++;
  });
  document.getElementById("search-results").innerHTML = html;

  var buttons = document.getElementsByClassName('app-download-button');

  Array.prototype.forEach.call(buttons, function(button) {
    button.addEventListener('click', function(event) {
      downloadFile(button.dataset.hostname, button.dataset.filename, app.user);
    });
  });

}

