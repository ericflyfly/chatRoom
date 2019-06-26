var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://137.189.75.168');
client.on('connect', function() {
    setInterval(function (){
        client.publish('myTopic', 'Hello mqtt');
        console.log('Message Sent');
    }, 5000);
});