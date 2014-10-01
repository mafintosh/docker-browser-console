var WebSocketServer = require('ws').Server
var pump = require('pump')
var websocket = require('websocket-stream')
var proc = require('child_process')

var server = new WebSocketServer({port:10000})

server.on('connection', function(connection) {
  var stream = websocket(connection)
  var child = proc.spawn('docker', ['run', '-it', '--rm', 'mafintosh/dev'])

  pump(stream, child.stdin)
  pump(child.stdout, stream)
  pump(child.stderr, stream)

  stream.on('close', function() {
    child.kill()
  })
})
