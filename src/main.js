// eslint-disable-next-line no-undef
const client = new Client()
client.init()

window.addEventListener('load', () => { 
  client.start()
  client.run()
})