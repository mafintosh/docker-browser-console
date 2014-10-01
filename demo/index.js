var docker = require('../')
var websocket = require('websocket-stream')
var pump = require('pump')

var terminal = docker('mafintosh/dev')

pump(terminal, websocket('ws://'+location.host), terminal)
terminal.appendTo(document.getElementById('console'))
