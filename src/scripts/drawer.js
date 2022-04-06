function DrawText(text, x, y, color) {
  var xc = world.width / 2;
  var yc = world.height / 2;

  context.font = "normal 11pt Arial";

  context.fillStyle = WHITE;
  context.strokeStyle = WHITE;
  context.lineWidth = 3;
  context.lineJoin = "round";
  context.strokeText(text, xc + x, yc + y);

  context.lineWidth = 1;
  context.fillStyle = color;
  context.strokeStyle = color;
  context.fillText(text, xc + x, yc + y);
}

function DrawCircle(point, radius, Color, LineWidth) {
  circle = new Circle(point.x, point.y, radius);
  circle.Draw(Color, LineWidth);
}

// function DrawSquare(point, radius, color) {
//   var xc = world.width / 2;
//   var yc = world.height / 2;
//   context.strokeStyle = color;
//   context.lineWidth = 0.8;
//   if (color == BLACK)
//     context.lineWidth = 1.5;
//   context.beginPath();
//   context.moveTo(xc + point.x - radius, yc + point.y - radius);
//   context.lineTo(xc + point.x + radius, yc + point.y - radius);
//   context.lineTo(xc + point.x + radius, yc + point.y + radius);
//   context.lineTo(xc + point.x - radius, yc + point.y + radius);
//   context.lineTo(xc + point.x - radius, yc + point.y - radius);
//   context.stroke();
// }

function DrawSlowBezier() {

  // if( DragPoint == DragPointStart+4 ) {
	// 	dragpoints[DragPointStart+5].x += xOffset;
	// 	dragpoints[DragPointStart+5].y += yOffset;
	// }

  drawBezier( dragpoints, LIGHTGRAY);
  drawPartialBezier(dragpoints, BLACK, ProportionalDistance);

  // play animated spline.
  if (!Pause) {
    ProportionalDistance += 0.004
    if (ProportionalDistance > 1.0) {
      ProportionalDistance = 0.0
    }
  }
  
  drawControlLine()

  // var closest = ClosestBezierPoint(dragpoints[DragPointStart + 4], dragpoints[DragPointStart + 0], dragpoints[DragPointStart + 1], dragpoints[DragPointStart + 2], dragpoints[DragPointStart + 3]);
  // var CloseLine = new Line(dragpoints[DragPointStart + 4].x, dragpoints[DragPointStart + 4].y, closest.x, closest.y);
  // CloseLine.Draw(GREEN);
  // DrawCircle(closest, POINTRADIUS, BOLDRED, 1);

  // var BaseRadius = utils.distance(dragpoints[DragPointStart + 4], dragpoints[DragPointStart + 5]);
  // Find the circle intersection to the bezier curve
  // var intersections = CircleBezierIntersections(dragpoints[DragPointStart + 4], BaseRadius, dragpoints[DragPointStart + 0], dragpoints[DragPointStart + 1], dragpoints[DragPointStart + 2], dragpoints[DragPointStart + 3]);

  // intersections.forEach(function (element) {
  //   var curvePoint = GetBezierPoint(dragpoints[DragPointStart + 0], dragpoints[DragPointStart + 1], dragpoints[DragPointStart + 2], dragpoints[DragPointStart + 3], element);
  //   DrawSquare(curvePoint, POINTRADIUS, RED);
  // });

  // DrawCircle(dragpoints[DragPointStart + 4], BaseRadius, GRAY, 1);
}

function drawPartialBezier(points, color, amount) {
  var point = new Point(-100, 0);
  var t = amount;
  const xc = world.width / 2.0;
  const yc = world.height / 2.0;
  // const step_size = 0.001;
  context.strokeStyle = color;
  context.lineWidth = 1;
  const initPos = { x: xc + points[0].x, y: yc + points[0].y }
	context.beginPath();
  context.moveTo(initPos.x, initPos.y);
	var Gap = stepSize;
  // const stepGap = 0.2
	for( let Step = 0; Step <= amount; Step += Gap ) {
    point = getBezier( points, Step );
		context.lineTo( xc + point.x, yc + point.y );
	}
	context.stroke();
  FillCircle( point, POINTRADIUS * 2, BOLDRED );

}

function drawControlLine() {
  for(let i = 0; i + 1 < dragpoints.length; i++){
   const ControlLine1 = new Line(
     dragpoints[DragPointStart + i].x, 
     dragpoints[DragPointStart + i].y, 
     dragpoints[DragPointStart + i + 1].x, 
     dragpoints[DragPointStart + i + 1].y);
   ControlLine1.Draw(BLUE);
 }
}

// function DrawBezierCurve(points, color) {
//   // if (points.length === 1) {
//   // }
//   // var distance = utils.distance(point0, point1) + utils.distance(point1, point2) + utils.distance(point2, point3);
//   // var Steps = distance / 5.0; // this division seems to make the curves always look good enough.
//   // const newpoints = new Array(points.length)

//   var xc = world.width / 2.0;
//   var yc = world.height / 2.0;
//   context.strokeStyle = color;
//   context.lineWidth = 1.5;

//   context.beginPath();
//   // context.moveTo(xc + point0.x, yc + point0.y);

//   var Gap = 0.1;
//   for (var Step = Gap; Step < 1.0; Step += Gap) {
//     var point = GetBezierPoint(points, Step);
//     context.lineTo(xc + point.x, yc + point.y);
//   }
//   // context.lineTo(xc + point3.x, yc + point3.y);
//   context.stroke();
// }


// casteljau's algorithm (cursived lerp)
// P(t)=(1−t)A+tB
function getBezier(points, t){
	if(points.length == 1){
		return {x: points[0].x, y:points[0].y};
	} else{
		let newpoints = [];
		for(let i = 0; i + 1 < points.length; i++){
			let point = {
        x: ( (1-t) * points[i].x ) + ( t * points[i+1].x ),
        y: ( (1-t) * points[i].y ) + ( t * points[i+1].y )
      };
      newpoints.push(point);
		}
		return getBezier(newpoints, t);
	}
}

function drawBezier(points, color){
	let progress = 0;
  const xc = world.width / 2.0;
  const yc = world.height / 2.0;
  // const step_size = 0.1;
  context.strokeStyle = color;
  context.lineWidth = 1;
	context.beginPath();
  context.moveTo(xc + points[0].x, yc + points[0].y);
	while(progress < 1){
    // console.log("ttt", progress)
		let point = getBezier(points, progress);
    context.lineTo(xc + point.x, yc + point.y);
		progress += stepSize;
	}
	context.stroke();
}
