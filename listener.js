const IP_ADDR = '127.0.0.1'
const OSC_PORT = 49162
const osc = require('node-osc')
const oscserver = new osc.Server(OSC_PORT, IP_ADDR)

console.log(`Started Listener\n\nOSC:${OSC_PORT}\n`)

// Error
oscserver.on('error', (err) => {
  console.log(`OSC server:\n${err.stack}`)
  oscserver.close()
})

// Message
oscserver.on('message', (msg, rinfo) => {
  console.log(`OSC server: ${msg} from ${rinfo.address}:${rinfo.port} at ${msg[0]}`)
})
