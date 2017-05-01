var CoreApp = require('../');
var assert = require('assert');
var testSettings = require('./config.json');
var client = new CoreApp(testSettings);



client.subscribe('test_channel', 'notification', function(message){

	console.log(message);

});



