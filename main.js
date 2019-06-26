/*
const mqtt = require('mqtt');
var client = mqtt.connect('mqtt://iot.eclipse.org');


//subscriber
client.on('connect', function (){
    client.subscribe('Topic07');
    console.log('client has subscribed successfully');
});


//publisher
client.on('connect', function(){
    setInterval(function(){client.publish('Topic07', 'cricket');},3000);
});

client.on('message', function (topic, message){
    console.log(message.toString());//message comes as buffer
});
*/

//server
const http = require('http');
const server = http.createServer((req, res) => {

    if (req.url === '/'){
        res.write('Hello World');
        res.end();
    }

});


server.listen(3000);

console.log('Listening on port 3000....');

const mqtt = require('mqtt');
var client = mqtt.connect('mqtt://iot.eclipse.org');

client.on('connect', (port) =>{
    console.log('New user connected');
})