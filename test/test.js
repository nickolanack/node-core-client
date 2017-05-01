var CoreApp = require('../');
var assert = require('assert');
var testSettings = require('./config.json');
var client = new CoreApp(testSettings);



var logError = function(err) {

	console.log(err);
}

client.getUserMetadata()
	.then(function(metadata) {


		assert.equal(metadata.details.id, 0, 'Expected user not logged in');

		return client.login(testSettings.username, testSettings.password).then().catch(logError);

	})
	.then(function(user) {

		console.log((typeof user) + JSON.stringify(user));

		return client.getUserMetadata()
			.then(function(metadata) {

				console.log((typeof metadata) + JSON.stringify(metadata));
				
				assert.equal(metadata.details.id, user.id, 'Expected user to be logged in');
				
			})

	})
	.then(function(){
		return client.getLoginStatus().then(function(loggedIn){
			assert(loggedIn,'Expected to be loggedIn')
		});
	})
	.catch(logError);