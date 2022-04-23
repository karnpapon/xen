/* global Point */
/* global BLACK */

function BezierPoint(client) {
  
  this.init = () => {
    this.bezierPoints = new Array( { 
      speed: client.distanceSpeed, 
      toggle: {
        showLPoints: false,
        showRPoints: false,
        showControlLine: true,
      },
      trigger: {
        allPoint: false
      },
      muted: false,
      midi: { 
        chan: 0,
        chanPoints: 0 
      },
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
      toggle: {
        showLPoints: false,
        showRPoints: false,
        showControlLine: true,
      },
      trigger: {
        allPoint: false
      },
      midi: { 
        chan: ( this.bezierPoints.length ) % 16,
        chanPoints: ( this.bezierPoints.length ) % 16  
      },
      points: new Array ( 
        new Point(150, -100, BLACK), 
        new Point(250, 0, BLACK) 
      )
    })
    client.proportionalDistance.push(client.distanceSpeed)
  };


  this.setToggle = (idx, type) => {
    this.bezierPoints[idx]["toggle"][type] = !this.bezierPoints[idx]["toggle"][type]
  }
}