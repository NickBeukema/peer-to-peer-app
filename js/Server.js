var fs = require('fs');
var ftpd = require('ftpd');
var Server = ftpd.FtpServer;

var root = __dirname;

var options = {
    host: '127.0.0.1',
    port: 7710,
    user: 'jack',
    pass: "test",
    tlsOnly: false,
    getInitialCwd: function(){
        return options.cwd;
    },
    getRoot: function(connection, callback){
        var username = connection.username;
        fs.realpath(root, callback);
    }
};

module.exports = {
    defaultOptions: function(){
        return options;
    },
    server: function(customOptions){
        customOptions = customOptions || {};
        Object.keys(options).forEach(function(key){
            if (!customOptions.hasOwnProperty(key)){
                customOptions[key] = options[key];
            }
        });
        var server = new Server(customOptions.host, customOptions);

        server.on('client:connected', function(connection){
            var username;
            connection.on('command:user', function(user, success, failure){
                if (user === customOptions.user){
                    username = user;
                    success();
                } else {
                    failure();
                }
            });

            connection.on('command:pass', function(pass, success, failure){
                if (pass === customOptions.pass){
                    success(username);
                } else {
                    failure();
                }
            });
        });

        server.listen(customOptions.port);
        console.log("ftp server started");
        return server;
    }
};