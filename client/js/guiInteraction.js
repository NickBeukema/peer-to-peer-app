var app = {};
var port = 7710;
var server = require("./js/ftps").server({port: port});
var client = require("./js/ftpc").client({port: port});

var trackerAddress = document.getElementById("tracker-address");
var trackerPort = document.getElementById("tracker-port");
var username = document.getElementById("username");
var hostname = document.getElementById("hostname");
var connectionSpeed = document.getElementById("speed");

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

    console.log("!!!");
    var tracker = {
        "address": trackerAddress.value || "127.0.0.1",
        "port": trackerPort.value || 6548
    };

    var user = {
        "username": username.value || "jack",
        "hostname": hostname.value || "127.0.0.1",
        "connectionSpeed": connectionSpeed.value || "fiber",
        "files": [{"filename": "dd.txt", "description": "My file of the abcs"}, {"filename": "coffde.rb", "description": "My ruby code"}]
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

function updateSearchResults(res){
    var html = "";
    console.log("Search results");
    var i = 1;
    res.forEach(function(file){
        console.log(file);
        html += "<tr><th scope='row'>" + i + 1 + "</th><td>" + file.speed + "</td><td>" + file.hostname + "<td>" + file.filename + "</td></td></tr>";
        i++;
    });
    document.getElementById("search-results").innerHTML = html;
}

