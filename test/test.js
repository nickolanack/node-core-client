var CoreApp = require('../');
var assert = require('assert');
var testSettings = require('./config.json');
var client = new CoreApp(testSettings);



var logError = function(err) {

	console.log(err);
}

client.getUserMetadata()
	.then(function(metadata) {


		console.log((typeof metadata) + JSON.stringify(metadata));

		return client.login(testSettings.username, testSettings.password).then().catch(logError);

	})
	.then(function(user) {

		console.log((typeof user) + JSON.stringify(user));

		return client.getUserMetadata()
			.then(function(metadata) {

				console.log((typeof metadata) + JSON.stringify(metadata));
				if (metadata.details.id != user.id) {
					assert.equal(metadata.details.id, user.id, 'Expected userid');
				}
				assert.true()

			})

	})
	.catch(logError);