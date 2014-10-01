var duplexify = require('duplexify')
var ndjson = require('ndjson')
var proc = require('child_process')

module.exports = function() {
  var input = ndjson.parse()
  var output = ndjson.stringify()
  var result = duplexify()

  input.once('data', function(handshake) {
    if (handshake.type !== 'image') return result.destroy(new Error('Invalid handshake'))

    var child = proc.spawn('docker', ['run', '-it', '--rm', handshake.image])

    input.on('data', function(data) {
      if (data.type === 'stdin') child.stdin.write(data.data)
    })

    child.stdout.on('data', function(data) {
      output.write({
        type: 'stdout',
        data: data.toString()
      })
    })

    child.stderr.on('data', function(data) {
      output.write({
        type: 'stderr',
        data: data.toString()
      })
    })

    child.on('close', function() {
      result.destroy()
    })

    result.on('close', function() {
      child.kill()
    })
  })

  result.setReadable(output)
  result.setWritable(input)

  return result
}
