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

function midPoint(line) {
  return new Point((line.x1 + line.x2) / 2, (line.y1 + line.y2) / 2);
}

function removePoint(index) {
  dragpoints.bezierPoints[0].splice(index, 1)
}

function getBezierPoint( point0, point1, point2, point3, position ) {
	var point = new Point( 0, 0 );
	var t = position;
	var mt = 1-t;
	var mt_mt_mt = mt*mt*mt;
	var t_t_t = t*t*t;
	var t_t_mt = t*t*mt;
	var t_mt_mt = t*mt*mt;
	
	point.x = (point0.x * mt_mt_mt) + 3 * point1.x * t_mt_mt + 3 * point2.x * t_t_mt + point3.x*t_t_t;	
	point.y = (point0.y * mt_mt_mt) + 3 * point1.y * t_mt_mt + 3 * point2.y * t_t_mt + point3.y*t_t_t;

	return point;
}

function isFirstLine(i){
  return i === 0
}

function isLastLine(i, points){
  return i === points.length - 1 || i === points.length - 2
}