const OSC = require('osc-js')

const IP_ADDR = '127.0.0.1'
const OSC_PORT = 8888

// receiving websocket from Browser to Node, then forward to 'OSC_PORT' 
console.log(`********* Started OSC Bridge\n: on port ${OSC_PORT}\n ********* `)

const config = { udpClient: { host: IP_ADDR, port: OSC_PORT } }
const osc = new OSC({ plugin: new OSC.BridgePlugin(config) })

osc.open() // start a WebSocket server
osc.on('/test', message => { })
osc.on('/something', message => { })
osc.on('close', () => { console.log("connection was closed") });
osc.on('error', (err) => { console.log("OSC connection error: ", err) });
