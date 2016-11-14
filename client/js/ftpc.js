/**
 * Created by jack on 10/31/16.
 */

var Client = require('jsftp');

//default options
var options = {
    host: '127.0.0.1',
    port: 7710,
    user: 'ftpuser',
    pass: 'password',
    cwd: '/'
};

module.exports = {
    client: function(customOptions){
        customOptions = customOptions || {};
        Object.keys(options).forEach(function(key){
            if (!customOptions.hasOwnProperty(key)){
                customOptions[key] = options[key];
            }
        });

        var client = new Client(customOptions);

        client.auth(
          customOptions.user,
          customOptions.pass,
          function(err, res){
            if (err){
              console.log(err);
              return;
            }
            console.log(res);
          }
        );

        return client;
    }
};
