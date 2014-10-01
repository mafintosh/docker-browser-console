var Terminal = require('term.js')
var computed = require('computed-style')
var ndjson = require('ndjson')
var duplexify = require('duplexify')

module.exports = function(image, opts) {
  if (!opts) opts = {}

  var result = duplexify()

  result.appendTo = function(elem) {
    if (typeof elem === 'string') elem = document.querySelector(elem)

    var dimensions = function() {
      var el = document.createElement('div')
      el.innerHTML = 'X'
      el.style.float = 'left'
      el.style.position = 'absolute'
      el.style.left = '-1000px'
      el.style.top = '-1000px'
      elem.appendChild(el)
      var dims = [el.offsetWidth, el.offsetHeight]
      elem.removeChild(el)
      return dims
    }()

    var wid = Math.floor(parseInt(computed(elem, 'width'), 10) / dimensions[0])
    var hei = Math.floor(parseInt(computed(elem, 'height'), 10) / dimensions[1])

    var term = new Terminal({
      cols: wid,
      rows: hei,
      convertEol: true
    })

    var input = ndjson.parse()
    var output = ndjson.stringify()

    output.write({
      type: 'image',
      image: image,
      width: wid,
      height: hei
    })

    input.on('data', function(data) {
      if (data.type === 'stderr' || data.type === 'stdout') return term.write(data.data)
    })

    term.open(elem)
    result.setWritable(input)
    result.setReadable(output)

    term.on('data', function(data) {
      output.write({type:'stdin', data:data})
    })

    term.on('title', function(title) {
      result.emit('title', title)
    })

    result.on('close', function() {
      term.destroy()
    })
  }

  return result
}