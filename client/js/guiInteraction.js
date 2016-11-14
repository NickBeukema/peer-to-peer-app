var app = {};
var ftpListeningPort = 7710;
var ftpClientConnectPort = 7710;
//var ftpClient = require("./js/ftpc").client({port: port});
var ftpClient = require("./js/ftpc");
var ftpServer = require("./js/ftps");
var ipc = require('ipc');
//var ftpServer = require("./js/ftps").server({port: port});

var trackerAddress = document.getElementById("tracker-address");
var trackerPort = document.getElementById("tracker-port");
var username = document.getElementById("username");
var hostname = document.getElementById("hostname");
var connectionSpeed = document.getElementById("speed");

var fs = require('fs');

ipc.send('getPort');
ipc.on('receivePorts', function(ports){
  console.log(ports);
  ftpListeningPort = ports.ftpport;
  ftpClientConnectPort = ports.trackerport;
});

var enums = {
  "disconnected": 0,
  "connected": 1
}

var disconnected = enums.disonnected;
var connected = enums.connected;

app.status = disconnected;

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

  if(app.status === connected){
    self.classList.remove("btn-danger");

    //disconnect from server
    self.classList.add("btn-primary");
    self.innerText = "connect to tracker";

    disconnectFromServer(app.tracker, app.user, function(res){
      console.log(res);
      updateGUI(disconnected);
      openServerInfoSection();
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
        updateGUI(connected);
        closeServerInfoSection();

      }, 500);
      self.innerText = "connected!";
      app.tracker = tracker;
      app.user = user;

      uploadFiles(user.username);
      app.ftpServer = ftpServer.server({port: ftpListeningPort}, user.username);
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
  console.log(ftpClientConnectPort);
  app.ftpConnection = ftpClient.client({host: hostname, port: ftpClientConnectPort});

  var str = ""; // Will store the contents of the file
  app.ftpConnection.get('/' + filename, user.username + '/' + filename, function(hadErr) {
    if (hadErr) {
      console.error('There was an error retrieving the file.');
    } else {
      console.log('File copied successfully!');
    }
  });
}

function updateSearchResults(res){
  var html = "";
  console.log("Search results");
  var i = 1;
  res.forEach(function(file){
    html += "<tr class='app-search-row'><th scope='row'>" + i + "</th><td>" + file.speed + "</td><td>" + file.hostname + "<td>" + file.filename + "</td><td>" + file.description + "</td><td><button class='btn app-download-button' data-hostname='" + file.hostname + "' data-filename='" + file.filename + "'>Download</td></tr>";
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

var serverInfoSection = document.getElementsByClassName('app-server-info')[0];
var connectedSection = document.getElementsByClassName('app-connected-section')[0];

function updateGUI(connStatus) {
  app.status = connStatus;

  if(app.status === connected) {
    closeServerInfoSection();
    serverInfoSection.classList.add('connected');
    connectedSection.classList.remove('collapsed');
  } else if(app.status === disconnected) {
    openServerInfoSection();
    serverInfoSection.classList.remove('connected');
    connectedSection.classList.add('collapsed');
  }
}

function toggleServerInfoSection() {
  serverInfoSection.classList.toggle('collapsed');
}

function openServerInfoSection() {
  serverInfoSection.classList.remove('collapsed');
}

function closeServerInfoSection() {
  serverInfoSection.classList.add('collapsed');
}

var toggleServerInfoButton = document.getElementsByClassName('app-toggle-server-info')[0];
toggleServerInfoButton.addEventListener('click', function(event) {
  toggleServerInfoSection();
});
