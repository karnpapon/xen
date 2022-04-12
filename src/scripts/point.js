// function Point(client) {
//   // this.app = client

//   this.new = (x, y, color) => {
//     if (x != undefined && x != null && y != undefined && y != null) {
//       this.x = x;
//       this.y = y;
//     } else {
//       this.x = 0.0;
//       this.y = 0.0;
//     }
//     if (color != undefined && color != null) this.color = color;
//     else this.color = BLACK;
//     return this
//   } 
// }

function Point(x, y, color) {
  if (x != undefined && x != null && y != undefined && y != null) {
    this.x = x;
    this.y = y;
  } else {
    this.x = 0.0;
    this.y = 0.0;
  }
  if (color != undefined && color != null) this.color = color;
  else this.color = BLACK;
}


Point.prototype.midPoint = (line) => {
  return this.new((line.x1 + line.x2) / 2, (line.y1 + line.y2) / 2);
}

// Point.prototype.removePoint = (index) => {
//   this.app.dragpoints.bezierPoints[dragPointGroup].splice(index, 1)
// }

Point.prototype.getBezierPoint = ( point0, point1, point2, point3, position ) => {
  let point = this.new( 0, 0 );
  const t = position;
  const mt = 1-t;
  const mt_mt_mt = mt*mt*mt;
  const t_t_t = t*t*t;
  const t_t_mt = t*t*mt;
  const t_mt_mt = t*mt*mt;
  
  point.x = (point0.x * mt_mt_mt) + 3 * point1.x * t_mt_mt + 3 * point2.x * t_t_mt + point3.x*t_t_t;	
  point.y = (point0.y * mt_mt_mt) + 3 * point1.y * t_mt_mt + 3 * point2.y * t_t_mt + point3.y*t_t_t;

  return point;
}



