//var events = require("events");

var Promise = require("promise");

function CoreAppClient(config) {
	var me = this;
	me.config = config;
	//events.EventEmitter.call(me);

};

var request = require("request").defaults({
	jar: true
})







CoreAppClient.prototype.__proto__ = events.EventEmitter.prototype;



CoreAppClient.prototype.request = function(url) {

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


CoreAppClient.prototype.task = function(task, params, path) {

	 var url=me.config.url + "administrator/components/com_geolive/core.php?0=1&format=ajax";
	 if(path){
	 	url=me.config.url + path;
	 }

	 url=url+"&task="+task;
	 var json="&json={}";
	 if(params){
	 	json="&json="+JSON.stringify(params);
	 }
	 url=url+json;

	 return me.request(url);

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

	return new Promise(function(resolve, reject){
	
	 	me.isConnected().then(function() {

			me.task("login", {
				"username": username,
				"password": password
			}).then(function(user){
				me._id=user.id;
				resolve(user);
			}).catch(reject);

		});

		
	});
};



CoreAppClient.prototype.getLoginStatus= function() {
	var me=this;
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


CoreAppClient.prototype.subscribe= function(channel, event, handler) {
	var me=this;


	if(!me._pusher){
		var Pusher = require("pusher-js");

		me.pusher = new Pusher(me.config.pusherAppKey);

	}
	
	me.pusher.subscribe(channel).bind(event, handler);

}


CoreAppClient.prototype.broadcast= function(channel, event, data) {
	var me=this;

	return me.isConnected().then(function() {

		return me.task("emit_notification", {
			"plugin": "PusherMessages",
			"channel":channel,
            "event":event,
            "data":data
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