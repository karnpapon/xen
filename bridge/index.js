import OSC from 'osc-js';
import { Client } from 'node-osc';

const IP_ADDR = '0.0.0.0'
const OSC_PORT = 3333

const client = new Client('172.20.10.9', 3333)

// // receiving websocket from Browser to Node, then forward to 'OSC_PORT' 
console.log(`********* Started OSC Bridge\n: on port ${OSC_PORT}\n ********* `)

const config = { udpClient: { host: IP_ADDR, port: OSC_PORT } }
const osc = new OSC({ plugin: new OSC.BridgePlugin(config) })
osc.open({ host: IP_ADDR, port: OSC_PORT}) // listening on 'ws://localhost:8080'
osc.on('/oscMsg', message => {  
  client.send('/oscMsg', Math.random(), () => {
      // client.close()
  })
})
