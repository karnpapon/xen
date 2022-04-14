const OSC = require('osc-js')

const IP_ADDR = '0.0.0.0'
const OSC_PORT = 8080

// receiving websocket from Browser to Node, then forward to 'OSC_PORT' 
console.log(`********* Started OSC Bridge\n: on port ${OSC_PORT}\n ********* `)

const config = { udpClient: { host: IP_ADDR, port: OSC_PORT } }
const osc = new OSC({ plugin: new OSC.BridgePlugin(config) })
osc.open({ host: IP_ADDR, port: OSC_PORT}) // listening on 'ws://localhost:8080'
osc.on('/test', message => { console.log("osc msg out =", message) })
