'use strict'

function Osc (client) {
  const osc = require('node-osc')
  
  this.stack = []
  this.socket = null
  this.options = { default: 49162, superCollider: 57120 }
  this.port = this.options.default

  this.start = () => {
    console.log("oscoscoscosc", osc)
    if (!osc) { console.warn('OSC', 'Could not start.'); return }
    console.info('OSC', 'Starting..')
    this.setup()
    this.select()
  }

  this.clear = () => {
    this.stack = []
  }

  this.run = () => {
    for (const item of this.stack) {
      this.play(item)
    }
  }

  this.push = (path, msg) => {
    this.stack.push({ path, msg })
  }
  
  this.play = ({ path, msg }) => {
    if (!this.socket) { console.warn('OSC', 'Unavailable socket'); return }
    const oscMsg = new osc.Message(path)
    for (let i = 0; i < msg.length; i++) {
      oscMsg.append(msg)
    }
    this.socket.send(oscMsg, (err) => {
      if (err) { console.warn(err) }
    })
  }

  this.select = (port = this.options.default) => {
    if (parseInt(port) === this.port) { console.warn('OSC', 'Already selected'); return }
    if (isNaN(port) || port < 1000) { console.warn('OSC', 'Unavailable port'); return }
    console.info('OSC', `Selected port: ${port}`)
    this.port = parseInt(port)
    this.setup()
  }

  this.setup = () => {
    if (!this.port) { return }
    if (this.socket) { this.socket.close() }
    this.socket = new osc.Client(client.io.ip, this.port)
    console.info('OSC', `Started socket at ${client.io.ip}:${this.port}`)
  }
}
