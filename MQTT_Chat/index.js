const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mqtt = require('mqtt');

//share variable
var num_connect = 0;
var num_msg = 0;

//connect with frontend
app.get('/', function(req, res) {
    res.render('index.ejs');
});

const client = mqtt.connect('mqtt://test.mosquitto.org');

//Listen message event and then take action respectively
client.on('message', function(topic, message){
    message = message.toString();
    switch(topic){
        case 'chat_room/username':
            //console.log('Receive %s from %s', message, topic);
            io.emit('is_online', '🔵 <i>' + message + ' join the chat..</i>');
            num_connect += 1;
            client.publish('status/num_connect', num_connect.toString());
            io.emit('num_update', num_connect.toString());
            break;
        case 'chat_room/disconnect':
            //console.log('Receive %s from %s', message, topic);
            io.emit('is_online', '🔴 <i>' + message + ' left the chat..</i>');
            num_connect -= 1;
            client.publish('status/num_connect', num_connect.toString());
            io.emit('num_update', num_connect.toString());
            break;
        case 'chat_room/chat_message':
            //console.log('Receive %s from %s', message, topic);
            username = message.split(' ', 1);
            //console.log(username);
            io.emit('chat_message', '<strong>' + username[0] + '</strong>: ' + message.substring(username[0].length + 1, message.length));
            break;
        default:
            console.log('\'%s\' topic not handled --> ', topic);
    }
});


//socket.io communication with the frontend
io.sockets.on('connection', function(socket) {
    socket.on('username', function(username) {
        //MQTT Connection success, subscribe to certain topics
        client.subscribe('chat_room/disconnect');
        client.subscribe('chat_room/username');
        client.subscribe('chat_room/chat_message');
        //client.subscribe('chat_room/#');
        socket.username = username;
        client.publish('chat_room/username', username);
    });

    socket.on('disconnect', function(username) {
        client.publish('chat_room/disconnect', socket.username);
    })

    socket.on('chat_message', function(message) {
        client.publish('chat_room/chat_message', socket.username + " " +message);
    });

})


//create http server
const server = http.listen(8080, function() {
    console.log('listening on *:8080');
});