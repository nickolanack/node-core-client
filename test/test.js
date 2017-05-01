var CoreApp = require('../');
var assert = require('assert');
var testSettings = require('./config.json');
var client = new CoreApp(testSettings);



var logError = function(err) {

	console.log(err);
}

client.getUserMetadata()
	.then(function(metadata) {

		console.log(metadata);
		assert.equal(metadata.details.id, 0, 'Expected user not logged in');

		return client.login(testSettings.username, testSettings.password);

	})
	.then(function(user) {

		console.log(user);
		return client.getUserMetadata().then(function(metadata){
			console.log(metadata);
			assert.equal(metadata.details.id, user.id, 'Expected user to be logged in');
			return client.getLoginStatus();
		})
			
	})
	.then(function(loggedIn){
		assert(loggedIn,'Expected to be loggedIn')
	})
	.catch(logError);