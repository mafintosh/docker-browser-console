var Terminal = require('term.js')
var websocket = require('websocket-stream')

var socket = websocket('ws://localhost:10000')

var term = new Terminal({
  cols: 80,
  rows: 40,
  screenKeys: true
});

term.on('data', function(data) {
  socket.write(data)
});

term.on('title', function(title) {
  document.title = title;
});

term.open(document.body);

socket.on('data', function(data) {
  data = data.toString().replace(/\n/g, '\r\n')
  term.write(data)
});

socket.on('end', function() {
  term.destroy()
})
