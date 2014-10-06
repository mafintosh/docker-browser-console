var duplexify = require('duplexify')
var ndjson = require('ndjson')
var proc = require('child_process')
var run = require('docker-run')

module.exports = function(image, opts) {
  var input = ndjson.parse()
  var output = ndjson.stringify()
  var result = duplexify()

  input.once('data', function(handshake) {
    if (handshake.type !== 'run') return result.destroy(new Error('Invalid handshake'))

    var child = run(image, {
      tty: true,
      width: handshake.width,
      height: handshake.height
    })

    input.on('data', function(data) {
      if (data.type === 'resize') child.resize(data.width, data.height)
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

    child.on('exit', function() {
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
