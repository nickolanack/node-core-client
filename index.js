var events = require('events');

var Promise = require('promise');

function CoreAppClient(config) {
	var me = this;
	me.config = config;
	events.EventEmitter.call(me);

};

var request = require("request").defaults({
	jar: true
})

var cookieClient = require('cookie-client');
var cookieStore = cookieClient();



var jsonRequest = function(url) {

	return new Promise(function(resolve, reject) {


		request(url, function(err, response, content) {

			if (err) {
				reject(err);
				return;
			}


			var obj = JSON.parse(content);

			if (obj && obj.success) {
				resolve(obj);
				return;
			}

			reject(obj);

		});
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

		console.log('Check connnected');

		jsonRequest(me.config.url + 'administrator/components/com_geolive/core.php?0=1&format=ajax&task=echo&json=' + JSON.stringify({
			"hello": "world"
		})).then(function(obj) {

			if (obj && obj.hello === "world") {
				me._connected = Date.now();
				me._connectedObj = obj;
				resolve(obj);
			}

		}).catch(reject);

	});

}

CoreAppClient.prototype.hasSession = function() {
	var me = this;
	return jsonRequest(me.config.url + 'administrator/components/com_geolive/core.php?0=1&format=ajax&task=session_key&json=' + JSON.stringify({}));
}


CoreAppClient.prototype.login = function(username, password) {
	var me = this;
	return me.isConnected().then(function() {

		return new Promise(function(resolve, reject){

			jsonRequest(me.config.url + 'index.php?option=com_geolive&format=ajax&iam=node-client.guest&task=login&json=' + JSON.stringify({
				"username": username,
				"password": password
			})).then(function(user){
				me._id=user.id;
			}).catch(reject);

		});

		
	});
};


CoreAppClient.prototype.getLoginStatus= function() {
	
	return new Promise(function(resolve, reject) {

		if (me._id && me._id > 0) {
			resolve(true);
			return;
		}

		return new Promise(function(resolve, reject){

			me.getUserMetadata().then(function(metadata){
				if(metadata.details.id>0){
					resolve(true)
				}
				resolve(false);

			}).catch(reject);

		});

	});

}


CoreAppClient.prototype.getUserMetadata = function(user) {
	var user = user > 0 ? user : -1
	var me = this;
	return me.isConnected().then(function() {

		return jsonRequest(me.config.url + 'administrator/components/com_geolive/core.php?0=1&format=ajax&task=user_metadata&json=' + JSON.stringify({
			"user": user
		}));

	});

};

module.exports = CoreAppClient;