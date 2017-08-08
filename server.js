// Express setup and Socket io
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require("express");

http.listen(3001, function(){
  console.log('listening on *:3001');
});

app.use(express.static(__dirname + '/dist'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/dist/index.html');
});


// MUSE port binding
var PORT = 33333;
var HOST = '127.0.0.1';
var dgram = require('dgram');
var server = dgram.createSocket({type:"udp4",reuseAddr:true});
// server.bind(9000);

var oscmsg = require("osc-msg");

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
  const bundle = oscmsg.decode(message, { strict: true, strip: true, bundle: true });

	if (bundle.error) {
		return;
	}

	bundle.elements.forEach((message) => {
		io.emit('message', JSON.stringify(message));
	});

});

server.bind(PORT, HOST);

function arrayBufferToString(buffer){
    var arr = new Uint8Array(buffer);
    var str = String.fromCharCode.apply(String, arr);
    if(/[\u0080-\uffff]/.test(str)){
        throw new Error("this string seems to contain (still encoded) multibytes");
    }
    return str;
}
