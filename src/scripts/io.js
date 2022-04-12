'use strict'

/* global Midi */

function IO (client) {
  this.ip = '127.0.0.1'

  this.midi = new Midi(client)

  this.start = function () {
    this.midi.start()
    this.clear()
  }

  this.clear = function () {
    this.midi.clear()
  }

  this.run = function () {
    this.midi.run()
  }

  this.silence = function () {
    this.midi.silence()
  }

  this.setIp = function (addr = '127.0.0.1') {
    if (validateIP(addr) !== true && addr.indexOf('.local') === -1) { console.warn('IO', 'Invalid IP'); return }
    this.ip = addr
  }

  this.length = function () {
    return this.midi.length()
  }

  this.inspect = function (limit = client.grid.w) {
    let text = ''
    for (let i = 0; i < this.length(); i++) {
      text += '|'
    }
    return fill(text, limit, '.')
  }

  function validateIP (addr) { return !!(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(addr)) }
  function fill (str, len, chr) { while (str.length < len) { str += chr }; return str }
}
