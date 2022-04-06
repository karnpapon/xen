function DrawText(text, x, y, color) {
  var xc = world.width / 2;
  var yc = world.height / 2;

  context.font = "normal 9pt Arial";
  context.lineWidth = 1;
  context.fillStyle = color;
  context.strokeStyle = color;
  context.fillText(text, xc + x + 5, yc + y);
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

function DrawBezierSpline() {

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
  
  // drawControlLine()

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

function drawPartialBezier(points, color, t) {
  const xc = world.width / 2.0;
  const yc = world.height / 2.0;
  const initPos = { x: xc + points[0].x, y: yc + points[0].y }
  let point = new Point(initPos.x, initPos.y);
  
  context.strokeStyle = color;
  context.lineWidth = 1;
	context.beginPath();
  context.moveTo(initPos.x, initPos.y);
	const gap = stepSize;
	for( let step = 0; step <= t; step += gap ) {
    point = getBezier( points, step );
		context.lineTo( xc + point.x, yc + point.y );
	}
	context.stroke();
  FillCircle( point, POINTRADIUS, BLACK );

  for(let i = 0; i + 1 < points.length; i++){
    const x1 = points[DragPointStart + i].x;
    const y1 = points[DragPointStart + i].y;
    const x2 = points[DragPointStart + i + 1].x;
    const y2 = points[DragPointStart + i + 1].y;
    const ControlLine1 = new Line( x1,y1,x2,y2);
    ControlLine1.Draw(BLUE);

    if (utils.linePointCollision(x1,y1,x2,y2,point.x,point.y) ) {
      ControlLine1.Draw(BLACK);
    }
  }
}

// function drawControlLine() {
//   for(let i = 0; i + 1 < dragpoints.length; i++){
//     const x1 = dragpoints[DragPointStart + i].x;
//     const y1 = dragpoints[DragPointStart + i].y;
//     const x2 = dragpoints[DragPointStart + i + 1].x;
//     const y2 = dragpoints[DragPointStart + i + 1].y;
//     const ControlLine1 = new Line( x1,y1,x2,y2);
//     ControlLine1.Draw(BLUE);

//     if (utils.linePointCollision(x1,y1,x2,y2,point.x,point.y) ) {
//       console.log("point collide!!!")
//     }

//   }
// }

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

function drawBezierControlLine(points, color){
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
