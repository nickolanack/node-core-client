//var events = require("events");



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

	options.headers= {
              "Content-Type": "application/x-www-form-urlencoded"
            };
	var req = https.request(options, (res) => {

		var content='';
		res.on('data', (chunk) => {
			content = content + chunk;
		});
		res.on('end', () => {
			callback(null, res, content);
		});
	});

	req.on('error', (e) => {
		callback(e);
	});
	req.write(Object.keys(data).map(function(k){ return k+'='+encodeURI(data[k]); }).join('&'));
	req.end();

}

var promise=function(callback){

	var Promise = require("promise");
	return new Promise(callback);

}


CoreAppClient.prototype.promise = function(callback) {
	var me=this;
	if(me.config.promise){
		console.log('overide promise');
	}
	return (me.config.promise||promise)(callback);
}
CoreAppClient.prototype.request = function(options, data) {

	var me=this;


	return me.promise(function(resolve, reject) {

		(me.config.request||request)(options, data, function(err, response, content) {

			if (err) {
				reject(err);
				return;
			}

            console.log(options.path+':'+content);

			var obj = JSON.parse(content);

			if (obj && obj.success) {
				
				resolve(obj);
				return;
			}
			
			reject(obj);

		});
	});

};


CoreAppClient.prototype.task = function(task, params, pathComponent) {

	var me = this;

	var path = "administrator/components/com_geolive/core.php?0=1&format=ajax";

	if (pathComponent) {
		path=pathComponent;
	}

	var data={};
	//data.task = task;
	data.json = "{}";
	if (params) {
		data.json = JSON.stringify(params);
	}

	if (me._token) {
		path=path+"&access_token="+me._token.token;
	}


	return me.request({
		host: me.config.url,
		path: '/'+path+'&task='+task,
		method: 'POST',
	}, data);

}

CoreAppClient.prototype.isConnected = function() {
	var me = this;

	return me.promise(function(resolve, reject) {

		if (me._connected && me._connected > (Date.now() - (10 * 1000))) {
			resolve(me._connectedObj);
			return;
		}


		me.task("echo", {
			"hello": "world"
		}).then(function(obj) {

		
			if (obj && obj.hello === "world") {
				me._connected = Date.now();
				me._connectedObj = obj;
				resolve(obj);
				return;
			}

			reject(obj);

		}).catch(reject);

	});

}



CoreAppClient.prototype.login = function(username, password) {
	var me = this;

	return me.promise(function(resolve, reject) {

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
	return me.promise(function(resolve, reject) {

		if (me._id && me._id > 0) {
			console.log('resolve true');
			resolve(true);
			return;
		}

		

		me.getUserMetadata().then(function(metadata) {
			if (metadata.details.id > 0) {
				resolve(true)
			}
			resolve(false);

		}).catch(reject);

		

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
			"plugin": "Notifications",
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





CoreAppClient.prototype.registerDevice = function(deviceName) {
	var me = this;
	return me.isConnected().then(function() {

		return me.task("register_device", {
			"deviceName": deviceName,
			"plugin":"Apps"
		});

	});
};



CoreAppClient.prototype.createAccountForDevice = function(deviceId, provisioningKey) {
	var me = this;
	return me.isConnected().then(function() {

		return me.task("create_account", {
			"deviceId": deviceId,
			"provisioningKey": provisioningKey,
			"plugin":"Apps"
		}, "/index.php?option=com_geolive&format=ajax&iam=node-client.guest");

	});
};




CoreAppClient.prototype.getConfiguration = function(name) {
	var me = this;
	return me.isConnected().then(function() {

		return me.task("get_configuration", {
			"widget": name
		});

	});
};

CoreAppClient.prototype.getTemplate = function(name) {
	var me = this;
	return me.isConnected().then(function() {

		return me.task("get_template", {
			"widget": name,
		});

	});
};




CoreAppClient.prototype.loginDevice = function(deviceId, accountId, username, password) {
	var me = this;

	return me.promise(function(resolve, reject) {

		me.isConnected().then(function() {

			me.task("login_device", {
				"deviceId": deviceId,
				"accountId": accountId,
				"username": username,
				"password": password,
				"plugin":"Apps"
			}, "/index.php?option=com_geolive&format=ajax&iam=node-client.guest").then(function(user) {

				me._id = user.id;
				me._token = user.access_token;

				resolve(user);

			}).catch(reject);

		}).catch(reject);

	});

};


module.exports = CoreAppClient;