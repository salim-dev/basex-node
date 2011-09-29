var net = require("net")
, util = require("util")
, events = require("events")
, crypto = require("crypto")
, assert = require('assert');

var states = {
	DISCONNECTED : 0,
	CONNECTING : 1,
	AUTHORIZE : 2,
	CONNECTED : 3
};
var options = {};
var CHR0 = "\x00";

var buffer = "";

var BaseXStream = function(port, host, options) {
	var stream = net.createConnection(port, host);
	stream.setEncoding('utf-8');
	this.stream = stream;
	this.options = options;
	this.state = states.DISCONNECTED;
	events.EventEmitter.call(this);
	var self = this;
	stream.on("connect", function() {
		self.state = states.CONNECTING;
	});

	stream.on("data", function(reply) {
		console.dir(reply);
		buffer += reply;
		if (self.state == states.CONNECTING) {
			var ip = readline();
			send(options.username);
			var s = loginresponse(ip, options.password);
			send(s);
			self.state = states.AUTHORIZE;
		} else if (self.state == states.AUTHORIZE) {
			if (!0 == read().charCodeAt(0))
				throw "Failed to login";
			self.state = states.CONNECTED;
			self.emit("connected", 1);
			// send("info");
			send("OPEN test");
			send("XQUERY 1 to 5");
		} else {
			var l = readline();
			console.log(">>", l);
		}
	});

	stream.on("error", function(msg) {
		console.log("error");
	});

	stream.on("close", function() {
		console.log("close");
	});

	stream.on("end", function() {
		console.log("end");
	});

	stream.on("drain", function() {
		console.log("drain");
	});
	var send = function(str) {
		console.log(">>", str);
		self.stream.write(str + CHR0);
	};
};

function readline() {
	var p = buffer.indexOf(CHR0);
	assert.notEqual(p, -1, "no null");
	// console.log("data", l, p, buffer + ":");
	var ip = buffer.substring(0, p);
	buffer = buffer.substring(p + 1);
	return ip;
};
function read() {
	// console.log("data", l, p, buffer + ":");
	var ip = buffer.substr(0, 1);
	buffer = buffer.substr(1);
	return ip;
};
// basex login response
function loginresponse(timestamp, password) {
	// {username} {md5(md5(password) + timestamp)}
	var p1 = crypto.createHash('md5').update(password).digest("hex");
	var p2 = crypto.createHash('md5').update(p1 + timestamp).digest("hex");
	return p2;
};

util.inherits(BaseXStream, events.EventEmitter);
exports.BaseXStream = BaseXStream;