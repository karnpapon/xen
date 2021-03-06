/* global world */
/* global Line, Point */
/* global utils */
/* global FLOOR, RANDOM */
/* global POINTRADIUS */
/* global DASHLINESTYLE1, DASHLINESTYLE4 */
/* global BLUE, BLACK, LIGHTGRAY, GRAY, REDTRANSPARENT, ORANGETRANSPARENT */

function Drawer(client) {
  this.drawBezier = () => {
    // draw colored points on top of black points.
    for( let p = 0; p < client.dragpoints.bezierPoints.length; p++ ){

      let bezierPoints = client.dragpoints.bezierPoints[p]["points"];
  
      this.drawBezierSpline(bezierPoints, p);
      this.drawDragPoints(bezierPoints, p);
  
      if (!client.pause) {
        client.proportionalDistance[p] += client.dragpoints.bezierPoints[p]["speed"];
        if (client.proportionalDistance[p] > 1.0) {
          client.proportionalDistance[p] = 0.0;
        }
      }
    }
  }

  this.drawDragPoints = (bezierPoints, p) => {
    for ( let idx = client.dragPointStart; idx < bezierPoints.length; ++idx) {
      if (!bezierPoints[idx]) continue;
      const color = this.getColor(p,idx) 
      const text = `G${p}-P${idx} (${bezierPoints[idx].x},${bezierPoints[idx].y})`
      
      client.circle.fillCircle(
        bezierPoints[idx], 
        POINTRADIUS, 
        color
      );

      this.drawText(
        text,
        bezierPoints[idx].x + POINTRADIUS,
        bezierPoints[idx].y,
        color
      );
    }
  }
  
  this.getColor = (p,idx) => {
    if (client.dragpoints.bezierPoints[p]["muted"]) return GRAY
    if (p === client.dragPointGroup) return BLUE 
    else return client.dragpoints.bezierPoints[p]["points"][idx].color
  }
  
  this.drawText = (text, x, y, color) => {
    const xc = world.width / 2;
    const yc = world.height / 2;
  
    client.context.font = "normal 8pt Arial";
    client.context.lineWidth = 1;
    client.context.fillStyle = color;
    client.context.strokeStyle = color;
    client.context.fillText(text, xc + x + 5, yc + y);
  }
  
  this.drawBezierSpline = (points, groupIdx) => {
    const triggerable = !client.dragpoints.bezierPoints[groupIdx]["muted"]
    const color = !triggerable ? LIGHTGRAY : BLACK
    this.drawBezierGuidePath(points, GRAY);
    this.drawControlSplineAndBezierPoint(points, color, client.proportionalDistance[groupIdx], triggerable, groupIdx);
  }

  // Arc length parameterization (even point along the line).
  // this.distToTable = (LUT, distance) => {
  //   let arcLength = LUT[LUT.length - 1]; // total arc length.
  //   let n = LUT.length // n = sample count

  //   if (distance.between(0, arcLength)) { // check if the value is within the length of the curve.
  //     for(let i=0;i<n-1;i++){ // iterate through the list to find which segment our distance lies within.
  //       if(distance.within(LUT[i], LUT[i+1])) { // check if out input distance lies between two distances.
  //         return distance.remap(  // remap the distance range to the t-value range.
  //           LUT[i],  // prev dist
  //           LUT[i + 1], // next dist.
  //           i / (n - 1f), // prev t-value
  //           (i + 1) / (n - 1f) // next t-value.
  //         )
  //       }
  //     }
  //   }

  //   return distance / arcLength // distance is outside the length of the curve - extrapolate value outside.
  // }
  
  this.drawControlSplineAndBezierPoint = (points, color, t, triggerable, groupIdx) => {
    const toggleControl = client.dragpoints.bezierPoints[groupIdx]["toggle"];
    const triggerControl = client.dragpoints.bezierPoints[groupIdx]["trigger"];
    
    const xc = world.width / 2.0;
    const yc = world.height / 2.0;
    const initPos = { x: xc + points[0].x, y: yc + points[0].y };
    let point = new Point(initPos.x, initPos.y);
  
    client.context.strokeStyle = color;
    client.context.lineWidth = 2;
    client.context.beginPath();
    client.context.setLineDash([]);
    client.context.moveTo(initPos.x, initPos.y);
    const gap = client.stepSize / 100;
    for (let step = 0; step <= t; step += gap) {
      point = this.getBezier(points, step);
      client.context.lineTo(xc + point.x, yc + point.y);
    }
    client.context.stroke();
    client.circle.fillCircle(point, POINTRADIUS, color);
  
    if (!toggleControl.showControlLine && !toggleControl.showLPoints && !toggleControl.showRPoints) return
    if (triggerable) { this.drawRecursiveLine(points, t, point, groupIdx); } 
    if (!toggleControl.showControlLine) return
    if (!triggerable) return
  
    // control line (spline)
    for (let i = 0; i + 1 < points.length; i++) {
      const x1 = points[client.dragPointStart + i].x;
      const y1 = points[client.dragPointStart + i].y;
      const x2 = points[client.dragPointStart + i + 1].x;
      const y2 = points[client.dragPointStart + i + 1].y;
      const ControlLine1 = new Line(x1, y1, x2, y2);
      ControlLine1.draw(
        utils.makeRGB(
          FLOOR(client.customColor.x * 255),
          FLOOR(client.customColor.y * 255),
          FLOOR(client.customColor.z * 255)
        ),
        2,
        DASHLINESTYLE1
      );
  
      // prevent unneccessary triggering on first & last line(spline).
      if(!triggerControl.allPoint) {
        if(client.line.isFirstLine(i) || client.line.isLastLine(i, points)) continue;
      }
  
      if ( utils.linePointCollision(x1, y1, x2, y2, point.x, point.y)) {
        utils.throttle(() => this.trigger("chan", groupIdx), 60);
        ControlLine1.draw(BLUE, 6);
      }
    }
  }
  
  // TODO: elaborate this.
  this.trigger = (midiType, groupIdx) => {
    if(client.midiActived){
      const midiOutMsg = { 
        note: "C", 
        octave: 4, 
        channel: client.dragpoints.bezierPoints[groupIdx]["midi"][midiType], 
        velocity: 16, 
        length: 16
      }
      
      client.io.midi.push(
        midiOutMsg.channel, 
        midiOutMsg.octave, 
        midiOutMsg.note, 
        midiOutMsg.velocity, 
        midiOutMsg.length, 
        false 
      )
    }

    if(client.oscActived){
      // client.io.osc.push("/oscMsg", 112)
    }
  }
  
  // casteljau's algorithm (recursived lerp)
  // P(t)=(1???t)A+tB
  this.getBezier = (points, t) => {
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
      return this.getBezier(newpoints, t);
    }
  }
  
  this.drawRecursiveLine = (points, t, movingPoint, groupIdx) => {
    if (points.length == 1) { return; } 
    
    const toggleControl = client.dragpoints.bezierPoints[groupIdx]["toggle"];
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
          FLOOR(client.customRecursiveBezierColor.x * 255),
          FLOOR(client.customRecursiveBezierColor.y * 255),
          FLOOR(client.customRecursiveBezierColor.z * 255)
        ),
        0.5,
        DASHLINESTYLE4
      );

      // points along odd spline (left)
      if(toggleControl.showLPoints){
        client.circle.fillCircle({ x: x1, y: y1 }, POINTRADIUS, GRAY);
        if (utils.circleCircleCollision(x1,y1,POINTRADIUS,movingPoint.x,movingPoint.y, POINTRADIUS)){
          utils.throttle(() => this.trigger("chanPoints", groupIdx), 120);
          client.circle.fillCircle({ x: x1, y: y1 }, POINTRADIUS * 4, REDTRANSPARENT);
        }
      }

      // points along even spline (right)
      if(toggleControl.showRPoints){
        client.circle.fillCircle({ x: x2, y: y2 }, POINTRADIUS, GRAY);
        if (utils.circleCircleCollision(x2,y2,POINTRADIUS,movingPoint.x,movingPoint.y, POINTRADIUS)){
          utils.throttle(() => this.trigger("chanPoints", groupIdx), 120);
          client.circle.fillCircle({ x: x2, y: y2 }, POINTRADIUS * 4, ORANGETRANSPARENT);
        }
      }
    }
    return this.drawRecursiveLine(newpoints, t, movingPoint, groupIdx);
  }
  
  this.drawBezierGuidePath = (points, color) => {
    let progress = 0;
    const xc = world.width / 2.0;
    const yc = world.height / 2.0;
    client.context.setLineDash(DASHLINESTYLE4);
    client.context.strokeStyle = color;
    // context.setLineDash([]);
    client.context.lineWidth = 2;
    client.context.beginPath();
    client.context.moveTo(xc + points[0].x, yc + points[0].y);
    while (progress < 1) {
      let point = this.getBezier(points, progress);
      client.context.lineTo(xc + point.x, yc + point.y);
      progress += client.stepSize / 100;
    }
    client.context.stroke();
  }
  
}
