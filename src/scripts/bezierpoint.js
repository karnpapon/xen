function BezierPoint(client) {
  
  this.init = () => {
    this.bezierPoints = new Array( { 
      speed: client.distanceSpeed, 
      muted: false,
      points: new Array(
        new Point(-152, 29.5, BLACK), 
        new Point(81, -123, BLACK)
      )
    })
  }

  this.spawnNewGroup = (x, y) => {
    this.bezierPoints.push({
      speed: client.distanceSpeed, 
      muted: false,
      points: new Array ( 
        new Point(150, -100, BLACK), 
        new Point(250, 0, BLACK) 
      )
    })
    client.proportionalDistance.push(client.distanceSpeed)
  };
}