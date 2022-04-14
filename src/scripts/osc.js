/* eslint-disable no-undef */
'use strict'

function Osc (client) {
  const osc = new OSC();
  this.stack = []
  // this.socket = null
  this.options = { default: 8080, superCollider: 57120 }
  this.port = this.options.default

  this.start = () => {
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
    const oscMsg = new OSC.Message(path, msg);
    osc.send(oscMsg)
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
    osc.open({host: client.io.ip , port: this.port }) 
    console.info('OSC', `Started socket at ${client.io.ip}:${this.port}`)
  }

  // this.test = () => {
  //   const message = new OSC.Message('/something/', Math.random());
  //   osc.send(message)
  // }

  // osc.close();
}
