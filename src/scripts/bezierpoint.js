function BezierPoint() {
  this.bezierPoints = new Array( { 
    speed: distanceSpeed, 
    muted: false,
    points: new Array(
      new Point(100, 0, BLACK), 
      new Point(266, -135, BLACK)
    )
  })
}

BezierPoint.prototype.spawnNewGroup = function (x, y) {
  this.bezierPoints.push({
    speed: distanceSpeed, 
    muted: false,
    points: new Array ( 
      new Point(150, -100, BLACK), 
      new Point(250, 0, BLACK) 
    )
  })
  proportionalDistance.push(distanceSpeed)
};
