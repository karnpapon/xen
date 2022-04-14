const OSC = require('osc-js')

console.log(`********* Started OSC Server: ********* `)

const osc = new OSC({ plugin: new OSC.WebsocketServerPlugin() })
osc.open({ host: '0.0.0.0'}) // listening on 'ws://localhost:8080'
osc.on('/test', message => { console.log("osc msg out =", message) })
