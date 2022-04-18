'use strict'

/* global Midi */
/* global Osc */

function IO (client) {
  this.ip = '0.0.0.0'
  
  this.midi = new Midi(client)
  this.osc = new Osc(client)

  this.start = function () {
    this.midi.start()
    this.osc.start()
    this.clear()
  }

  this.clear = function () {
    this.midi.clear()
    // this.osc.clear()
  }

  this.run = function () {
    this.midi.run()
    this.osc.run()
    this.osc.clear()
  }

  this.silence = function () {
    this.midi.silence()
  }

  this.setIp = function (addr = '127.0.0.1') {
    if (validateIP(addr) !== true && addr.indexOf('.local') === -1) { console.warn('IO', 'Invalid IP'); return }
    this.ip = addr
    console.log('IO', 'Set target IP to ' + this.ip)
    this.osc.setup()
  }

  this.length = function () {
    return this.midi.length() + this.osc.stack.length
  }

  function validateIP (addr) { return !!(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(addr)) }
}
