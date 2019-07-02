const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const mqtt = require('mqtt');

//set up connection with various server
const client = mqtt.connect('mqtt://test.mosquitto.org');
const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server);

//share variables
let interval;
var num_connect = '0';
var num_msg = '0';

//listen connection event from MQTT
client.on('connect', function (){
  console.log("Connect to mqtt");
  client.subscribe('chat_room/num_connect');
  client.subscribe('chat_room/num_msg');
  //notice chatroom client monitor online
  client.publish('monitor/online');
});

//listen meesage received event from MQTT
client.on('message', function(topic, msg){
  msg = msg.toString();
  switch(topic){
    case 'chat_room/num_connect':
      num_connect = msg;
      io.emit("num_connect", msg);
      break;
    case 'chat_room/num_msg':
      num_msg = msg;
      io.emit("num_msg", msg);
      break;
    default:
      console.log('Error!!!! \'%s\' topic not handled --> ', topic);
  }
  //console.log('%s -> %s', topic, msg.toString());
});

/*
//this part work as well, but creates a new interval for every connected client.
//usable only for a single user.
io.on("connection", socket => {
  console.log("New client connected"), setInterval(
    () => getApiAndEmit(socket),
    10000
  );
  socket.on("disconnect", () => console.log("Client disconnected"));
});
*/

//get data from dark sky backend every 10 seconds
io.on("connection", socket => {
    console.log("New client connected");
    io.emit("num_connect", num_connect);
    io.emit("num_msg", num_msg);
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 10000);
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

//
const getApiAndEmit = async socket => {
    try {
      const res = await axios.get(
        "https://api.darksky.net/forecast/4c6fdaea805dcea5306ac2ae5b503f86/43.7695,11.2558"
      ); // Getting the data from DarkSky
      socket.emit("FromAPI", res.data.currently.temperature); // Emitting a new message. It will be consumed by the client
    } catch (error) {
      console.error(`Error: ${error.code}`);
    }
  };