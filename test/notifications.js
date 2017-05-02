var CoreApp = require('../');
var assert = require('assert');
var testSettings = require('./config.json');
var client = new CoreApp(testSettings);



// client.subscribe('test_channel', 'notification', function(message){

// 	console.log(message);

// });

client.login(testSettings.username, testSettings.password).then(function(account){
	console.log(account);
	client.broadcast('test_channel', 'notification', {"hello":"world"}).catch()

}).catch(function(err){
	console.log(err);
})


