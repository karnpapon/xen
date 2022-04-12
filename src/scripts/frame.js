function Frame(client){

  this.f = 0 // Frame

  this.run = function () {
    this.f += 1
  }

  this.reset = function () {
    this.f = 0
  }

  this.update = () => {
    client.drawer.drawBezier()
    client.xOffset = 0;
    client.yOffset = 0;
  }
  
}
