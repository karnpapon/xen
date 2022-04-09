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
  circle.draw(Color, LineWidth);
}

function drawBezierSpline(points) {
  drawBezierGuidePath(points, GRAY);
  drawControlSplineAndBezierPoint(points, BLACK, proportionalDistance);
}

function drawControlSplineAndBezierPoint(points, color, t) {
  
  const xc = world.width / 2.0;
  const yc = world.height / 2.0;
  const initPos = { x: xc + points[0].x, y: yc + points[0].y };
  let point = new Point(initPos.x, initPos.y);

  context.strokeStyle = color;
  context.lineWidth = 2;
  context.beginPath();
  context.setLineDash([]);
  context.moveTo(initPos.x, initPos.y);
  const gap = stepSize;
  for (let step = 0; step <= t; step += gap) {
    point = getBezier(points, step);
    context.lineTo(xc + point.x, yc + point.y);
  }
  context.stroke();

  fillCircle(point, POINTRADIUS, BLACK);

  if (!showControlLine) return

  drawRecursiveLine(points, t, point);

  // control line (spline)
  for (let i = 0; i + 1 < points.length; i++) {
    const x1 = points[dragPointStart + i].x;
    const y1 = points[dragPointStart + i].y;
    const x2 = points[dragPointStart + i + 1].x;
    const y2 = points[dragPointStart + i + 1].y;
    const ControlLine1 = new Line(x1, y1, x2, y2);
    ControlLine1.draw(
      utils.makeRGB(
        Math.floor(customColor.x * 255),
        Math.floor(customColor.y * 255),
        Math.floor(customColor.z * 255)
      ),
      2,
      DASHLINESTYLE1
    );

    // prevent unneccessary triggering on first & last line(spline).
    if(isFirstLine(i) || isLastLine(i, points)) continue;

    if (utils.linePointCollision(x1, y1, x2, y2, point.x, point.y)) {
      utils.throttle(trigger, 60);
      ControlLine1.draw(BLUE, 6);
    }
  }
}

// TODO: elaborate this.
function trigger() {
  let output = WebMidi.outputs[0];
  let channel = output.channels[1];
  channel.playNote("C3");
}

// function drawControlLine() {
//   for(let i = 0; i + 1 < dragpoints.bezierPoints[0].length; i++){
//     const x1 = dragpoints.bezierPoints[0][dragPointStart + i].x;
//     const y1 = dragpoints.bezierPoints[0][dragPointStart + i].y;
//     const x2 = dragpoints.bezierPoints[0][dragPointStart + i + 1].x;
//     const y2 = dragpoints.bezierPoints[0][dragPointStart + i + 1].y;
//     const ControlLine1 = new Line( x1,y1,x2,y2);
//     ControlLine1.draw(BLUE);

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
//     var point = getBezierPoint(points, Step);
//     context.lineTo(xc + point.x, yc + point.y);
//   }
//   // context.lineTo(xc + point3.x, yc + point3.y);
//   context.stroke();
// }

// casteljau's algorithm (cursived lerp)
// P(t)=(1−t)A+tB
function getBezier(points, t) {
  if (points.length == 1) {
    return { x: points[0].x, y: points[0].y };
  } else {
    let newpoints = [];
    for (let i = 0; i + 1 < points.length; i++) {
      let point = {
        x: (1 - t) * points[i].x + t * points[i + 1].x,
        y: (1 - t) * points[i].y + t * points[i + 1].y,
      };
      newpoints.push(point);
    }
    return getBezier(newpoints, t);
  }
}

function drawRecursiveLine(points, t, movingPoint) {
  if (points.length == 1) {
    // var constructionLine = new Line( points[0].x,  points[0].y, points[1].x, points[1].y );
    // constructionLine.draw( GOLD, 2 );
    return;
  } else {
    let newpoints = [];
    let constructionLine;
    for (let i = 0; i < points.length - 1; i++) {
      let point = {
        x: (1 - t) * points[i].x + t * points[i + 1].x,
        y: (1 - t) * points[i].y + t * points[i + 1].y,
      };
      newpoints.push(point);
    }

    for (let i = 0; i < newpoints.length - 1; i++) {
      const x1 = newpoints[i].x;
      const y1 = newpoints[i].y;
      const x2 = newpoints[i + 1].x;
      const y2 = newpoints[i + 1].y;

      constructionLine = new Line(x1, y1, x2, y2);
      constructionLine.draw(
        utils.makeRGB(
          Math.floor(customRecursiveBezierColor.x * 255),
          Math.floor(customRecursiveBezierColor.y * 255),
          Math.floor(customRecursiveBezierColor.z * 255)
        ),
        0.5,
        DASHLINESTYLE4
      );

      // points along odd spline (left)
      if(showLPoints){
        fillCircle({ x: x1, y: y1 }, POINTRADIUS, GRAY);
        if (utils.circleCircleCollision(x1,y1,POINTRADIUS,movingPoint.x,movingPoint.y, POINTRADIUS)){
          utils.throttle(trigger, 120);
          fillCircle({ x: x1, y: y1 }, POINTRADIUS * 4, REDTRANSPARENT);
        }
      }

      // points along even spline (right)
      if(showRPoints){
        fillCircle({ x: x2, y: y2 }, POINTRADIUS, GRAY);
        if (utils.circleCircleCollision(x2,y2,POINTRADIUS,movingPoint.x,movingPoint.y, POINTRADIUS)){
          utils.throttle(trigger, 120);
          fillCircle({ x: x2, y: y2 }, POINTRADIUS * 4, ORANGETRANSPARENT);
        }
      }
    }
    return drawRecursiveLine(newpoints, t, movingPoint);
  }
}

function drawBezierGuidePath(points, color) {
  let progress = 0;
  const xc = world.width / 2.0;
  const yc = world.height / 2.0;
  context.setLineDash(DASHLINESTYLE4);
  context.strokeStyle = color;
  // context.setLineDash([]);
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(xc + points[0].x, yc + points[0].y);
  while (progress < 1) {
    let point = getBezier(points, progress);
    context.lineTo(xc + point.x, yc + point.y);
    progress += stepSize;
  }
  context.stroke();
}
