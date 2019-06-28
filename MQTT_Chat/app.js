const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://test.mosquitto.org');


const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server); // < Interesting!

let interval;

client.on('connect', function (){
    client.subscribe('status/num_connect');
    console.log("connected to mqtt");
});

client.on('message', function(topic, msg){
    console.log(msg.toString());
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

io.on("connection", socket => {
    console.log("New client connected");
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 10000);
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));


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