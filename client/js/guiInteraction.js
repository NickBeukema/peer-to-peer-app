var app = {};

var ftpClient = require("./js/ftpc");
var ftpServer = require("./js/ftps");

var ftpListeningPort = 7710;
var ftpClientConnectPort = 7710;

var ipc = require('ipc');
var fs = require('fs');

var trackerAddress = document.getElementById("tracker-address");
var trackerPort = document.getElementById("tracker-port");
var username = document.getElementById("username");
var hostname = document.getElementById("hostname");
var connectionSpeed = document.getElementById("speed");

ipc.send('getPort');
ipc.on('receivePorts', function(ports){
  logIfDebugOn(ports);
  ftpListeningPort = ports.ftpport;
  ftpClientConnectPort = ports.trackerport;
});

var enums = {
  "disconnected": 0,
  "connected": 1,
  "success": 1,
  "error": 0
}

var disconnected = enums.disonnected;
var connected = enums.connected;

var successStatus = enums.success;
var errorStatus = enums.error;

app.status = disconnected;

function getFilesForUser(username, callback) {
  fs.readFile(username + '/filelist.json', 'utf8', function(err, fd) {
    if (err) { throw err; }

    callback(JSON.parse(fd));
  });
}

function addFileToFileList(username, filename, description, callback) {
  var newFile = { "filename": filename, "description": description }
  getFilesForUser(username, function(fileList) {
    var exists = false;
    fileList.files.forEach(function(file) {
      if(file.filename === newFile.filename) {
        file.description = newFile.description;
        exists = true;
      }
    });

    if(!exists) {
      fileList.files.push(newFile);
    }

    fs.writeFile(username + '/filelist.json', JSON.stringify(fileList, null, 2), 'utf-8', callback);
  });
}

function uploadFiles(username) {
  getFilesForUser(username, function(fileList){
    var body = {
      username: username,
      files: fileList.files
    };

    uploadFilesToServer(app.tracker, body, function(resp){
      logIfDebugOn(resp);
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
      logIfDebugOn(res);
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
    logIfDebugOn(res);
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

      var serverOpts = { port: ftpListeningPort }
      if(app.debug) { serverOpts.debug = 1 }

      app.ftpServer = ftpServer.server(serverOpts, user.username);
    }
  });
});

var search = document.getElementById("search-keyword");
search.addEventListener("keyup", function(event){
  if (event.keyCode === 13 || event.which === 13){
    logIfDebugOn("Searching for '" + this.value + "'");
    searchServer(app.tracker, app.user.username, this.value, updateSearchResults);
  }
});

function downloadFile(hostname, filename, description, user) {

  // Connecting to Peer FTP Server
  appendFTPStatusText('Connecting to ' + hostname + ':' + ftpClientConnectPort);
  app.ftpConnection = ftpClient.client({host: hostname, port: ftpClientConnectPort});

  appendFTPStatusText('Sucessfully connected to ' + hostname + ':' + ftpClientConnectPort);

  // Performing RETR from Peer FTP Server
  appendFTPStatusText('RETR ' + filename);
  app.ftpConnection.get('/' + filename, user.username + '/' + filename, function(hadErr) {
    if (hadErr) {
      appendFTPStatusText('There was an error retrieving the file: ' + filename, errorStatus);
    } else {
      appendFTPStatusText('File successfully downloaded: ' + filename, successStatus);
      addFileToFileList(user.username, filename, description, function(){
        uploadFiles(user.username);

        app.ftpConnection.raw.quit(function(err, data) {
          if (err) { return console.error(err); }
            appendFTPStatusText('FTP session closed with ' + hostname + ':' + ftpClientConnectPort);
        });

      });
    }
  });
}

var ftpTextArea = document.getElementsByClassName('app-ftp-statuses')[0];

function appendFTPStatusText(text, status) {
  var statusLine = document.createElement("p");
  var statusText = "";

  if(status === errorStatus) { statusText = "error"; }
  if(status === successStatus) { statusText = "success"; }

  statusLine.setAttribute("class", statusText);
  statusLine.textContent = text;

  ftpTextArea.appendChild(statusLine);

}

function updateSearchResults(res){
  var html = "";
  logIfDebugOn("Search results");
  var i = 1;
  res.forEach(function(file){
    html += "<tr class='app-search-row'><th scope='row'>" + i + "</th><td>" + file.speed + "</td><td>" + file.hostname + "<td>" + file.filename + "</td><td>" + file.description + "</td><td><button class='btn app-download-button' data-hostname='" + file.hostname + "' data-filename='" + file.filename + "' data-description='" + file.description + "'>Download</td></tr>";
    i++;
  });
  document.getElementById("search-results").innerHTML = html;

  var buttons = document.getElementsByClassName('app-download-button');

  Array.prototype.forEach.call(buttons, function(button) {
    button.addEventListener('click', function(event) {
      downloadFile(button.dataset.hostname, button.dataset.filename, button.dataset.description, app.user);
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

function logIfDebugOn(item) {
  if(app.debug) {
    console.log(item);
  }
}
