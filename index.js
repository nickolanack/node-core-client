var events = require('events');

var Promise = require('promise');

function CoreAppClient(config) {
	var me = this;
	me.config = config;
	events.EventEmitter.call(me);

};

var request = require("request").defaults({jar: true})

var cookieClient = require('cookie-client');
var cookieStore = cookieClient();



var jsonRequest = function(url, callback) {

	request(url, function(err, response, content) {

		if (err) {
			callback(err);
			return;
		}

		
		var obj = JSON.parse(content);
		callback(null, obj);
		
	});

};


CoreAppClient.prototype.__proto__ = events.EventEmitter.prototype;


CoreAppClient.prototype.isConnected = function() {
	var me = this;

	return new Promise(function(resolve, reject) {

		if (me._connected && me._connected > (Date.now() - (10 * 1000))) {
			resolve(me._connectedObj);
			return;
		}


		jsonRequest(me.config.url + 'administrator/components/com_geolive/core.php?0=1&format=ajax&task=echo&json=' + JSON.stringify({
			"hello": "world"
		}), function(err, obj) {

			if (err) {
				reject(err);
				return;
			}


			if (obj && obj.hello === "world") {
				me._connected = Date.now();
				me._connectedObj = obj;
				resolve(obj);
			}

		});



	});

}

CoreAppClient.prototype.hasSession = function() {
	var me = this;

	return new Promise(function(resolve, reject) {

		//me.isConnected().then(function(session) {
		


			jsonRequest(me.config.url + 'administrator/components/com_geolive/core.php?0=1&format=ajax&task=session_key&json=' + JSON.stringify({}), function(err, obj) {

				if (err) {
					reject(err);
					return;
				}

				console.log(obj);

				if (obj.success === true) {
					resolve(obj);
				} else {
					reject(obj);
				}

			});


		//}).catch(reject);



	});

}


CoreAppClient.prototype.login = function(username, password) {
	var me = this;
	return new Promise(function(resolve, reject) {

		me.isConnected().then(function() {

			jsonRequest(me.config.url + 'index.php?option=com_geolive&format=ajax&iam=node-client.guest&task=login&json=' + JSON.stringify({
				"username": username,
				"password": password,
			}), function(err, obj) {

				if (err) {
					reject(err);
					return;
				}


				if (obj.success === true) {
					resolve(obj);
				} else {
					reject(obj);
				}

			});


		}).catch(reject);


	});

};

CoreAppClient.prototype.getUserMetadata = function(user) {
	var user = user > 0 ? user : -1
	var me = this;
	return new Promise(function(resolve, reject) {

		me.isConnected().then(function() {

			jsonRequest(me.config.url + 'administrator/components/com_geolive/core.php?0=1&format=ajax&task=user_metadata&json=' + JSON.stringify({
				"user": user
			}), function(err, obj) {

				if (err) {
					reject(err);
					return;
				}

				resolve(obj);


			});

		}).catch(reject);



	});

};


module.exports = CoreAppClient;