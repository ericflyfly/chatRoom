var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://127.0.0.1')


client.on('connect', function () {
    client.subscribe('presence')
    //client.publish('presence', data);
})

// Get process.stdin as the standard input object.
var standard_input = process.stdin;

// Set input character encoding.
standard_input.setEncoding('utf-8');

// Prompt user to input data in console.
console.log("Please input text in command line.");

// When user input data and click enter key.
standard_input.on('data', data => {

    // Print user input in console.
    console.log('User Input Data : ' + data);
    client.publish('chatRoom', data);
})

client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString())
    //client.end()
})




/*client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})*/