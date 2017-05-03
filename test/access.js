var CoreApp = require('../');
var assert = require('assert');
var testSettings = require('./config.json');
var client = new CoreApp(testSettings);



var logError = function(err) {

	console.log('Error:');
	console.log(err);
}


var registerDevice=function(){
	return client.registerDevice("Test Device Name");
}
var createAccountForDevice=function(deviceId, provisioningKey){
	return client.createAccountForDevice(deviceId, provisioningKey);
}
var loginDevice=function(deviceId, accountId, username, password){
	return client.loginDevice(deviceId, accountId, username, password);
}

client.getUserMetadata()
	.then(function(metadata) {

		assert.equal(metadata.details.id, 0, 'Expected user not logged in');

		//return registerDevice();
		//return createAccountForDevice(132, 'dCLh7-DcKDDWxywe-kvyLy');
		
		return loginDevice(132, 142, 'test_device_name.132', 'W4-sQOR3-knXkI4srLj-1fM7Q-Dn')
	

	})
	.then(function(user) {

		console.log('logged in');
		return client.getUserMetadata();

	})
	.then(function(user){

		assert(user.details.id>0,'Expected to be loggedIn')


	})
	.catch(logError);