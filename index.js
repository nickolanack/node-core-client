//var events = require("events");

var Promise = require("promise");

function CoreAppClient(config) {
	var me = this;
	me.config = config;
	//events.EventEmitter.call(me);

};

// var request = require("request").defaults({
// 	jar: true
// })




var request = function(options, data, callback) {
	var https = require('https');

	const req = https.request(options, (res) => {

		var content='';
		res.on('data', (chunk) => {
			content = content + chunk;
		});
		res.on('end', () => {
			console.log(content);
			callback(null, res, content);
		});
	});

	req.on('error', (e) => {
		callback(e);
	});
	req.write(data);
	req.end();

}



CoreAppClient.prototype.request = function(url, data) {

	var me=this;

	return new Promise(function(resolve, reject) {


		(me.options.request||request)(url, data, function(err, response, content) {

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


CoreAppClient.prototype.task = function(task, params, path) {

	var me = this;

	if (!path) {
		path = "administrator/components/com_geolive/core.php?0=1&format=ajax";
	}

	var data={};
	data.task = task;
	data.json = "{}";
	if (params) {
		data.json = JSON.stringify(params);
	}

	if (me._token) {
		data.access_token = me._token.token;
	}

	path = path + json;

	return me.request({
		host: me.config.url,
		path: '/'+path,
		method: 'POST',
	}, data);

}

CoreAppClient.prototype.isConnected = function() {
	var me = this;

	return new Promise(function(resolve, reject) {

		if (me._connected && me._connected > (Date.now() - (10 * 1000))) {
			resolve(me._connectedObj);
			return;
		}

		console.log("Check connnected");

		me.task("echo", {
			"hello": "world"
		}).then(function(obj) {

			if (obj && obj.hello === "world") {
				me._connected = Date.now();
				me._connectedObj = obj;
				resolve(obj);
			}

		}).catch(reject);

	});

}



CoreAppClient.prototype.login = function(username, password) {
	var me = this;

	return new Promise(function(resolve, reject) {

		me.isConnected().then(function() {

			me.task("login", {
				"username": username,
				"password": password
			}, "/index.php?option=com_geolive&format=ajax&iam=node-client.guest").then(function(user) {

				me._id = user.id;
				me._token = user.access_token;

				resolve(user);
			}).catch(reject);

		});


	});
};



CoreAppClient.prototype.getLoginStatus = function() {
	var me = this;
	return new Promise(function(resolve, reject) {

		if (me._id && me._id > 0) {
			resolve(true);
			return;
		}

		return new Promise(function(resolve, reject) {

			me.getUserMetadata().then(function(metadata) {
				if (metadata.details.id > 0) {
					resolve(true)
				}
				resolve(false);

			}).catch(reject);

		});

	});

}


CoreAppClient.prototype.subscribe = function(channel, event, handler) {
	var me = this;


	if (!me._pusher) {
		var Pusher = require("pusher-js");

		me.pusher = new Pusher(me.config.pusherAppKey);

	}

	me.pusher.subscribe(channel).bind(event, handler);

}


CoreAppClient.prototype.broadcast = function(channel, event, data) {
	var me = this;

	return me.isConnected().then(function() {

		return me.task("emit_notification", {
			"plugin": "PusherMessages",
			"channel": channel,
			"event": event,
			"data": data
		});

	});



}



CoreAppClient.prototype.getUserMetadata = function(user) {
	var user = user > 0 ? user : -1
	var me = this;
	return me.isConnected().then(function() {

		return me.task("user_metadata", {
			"user": user
		});

	});

};

module.exports = CoreAppClient;