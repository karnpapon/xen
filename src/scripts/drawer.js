function Drawer(client) {
  this.drawBezier = () => {
    // draw colored points on top of black points.
    for( let p = 0; p < client.dragpoints.bezierPoints.length; p++ ){
  
      this.drawBezierSpline(client.dragpoints.bezierPoints[p]["points"], p);
      
      for ( let idx = client.dragPointStart; idx - 1 < client.dragPointStart + client.dragPointCount; ++idx) {
        if (!client.dragpoints.bezierPoints[p]["points"][idx]) continue;
        const color = this.getColor(p,idx) 
        const text = `G${p}-P${idx} (${client.dragpoints.bezierPoints[p]["points"][idx].x},${client.dragpoints.bezierPoints[p]["points"][idx].y})`
        
        client.circle.fillCircle(
          client.dragpoints.bezierPoints[p]["points"][idx], 
          POINTRADIUS, 
          color
        );
  
        this.drawText(
          text,
          client.dragpoints.bezierPoints[p]["points"][idx].x + POINTRADIUS,
          client.dragpoints.bezierPoints[p]["points"][idx].y,
          color
        );
      }
      // if (hover) {dragpoints.bezierPoints[0][id].color = BLUE }
  
      if (!client.pause) {
        client.proportionalDistance[p] += client.dragpoints.bezierPoints[p]["speed"];
        if (client.proportionalDistance[p] > 1.0) {
          client.proportionalDistance[p] = 0.0;
        }
      }
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
    this.drawControlSplineAndBezierPoint(points, color, client.proportionalDistance[groupIdx], triggerable);
  }
  
  this.drawControlSplineAndBezierPoint = (points, color, t, triggerable) => {
  
    const xc = world.width / 2.0;
    const yc = world.height / 2.0;
    const initPos = { x: xc + points[0].x, y: yc + points[0].y };
    let point = new Point(initPos.x, initPos.y);
  
    client.context.strokeStyle = color;
    client.context.lineWidth = 2;
    client.context.beginPath();
    client.context.setLineDash([]);
    client.context.moveTo(initPos.x, initPos.y);
    const gap = client.stepSize;
    for (let step = 0; step <= t; step += gap) {
      point = this.getBezier(points, step);
      client.context.lineTo(xc + point.x, yc + point.y);
    }
    client.context.stroke();
   
    client.circle.fillCircle(point, POINTRADIUS, color);
  
    if (triggerable) { this.drawRecursiveLine(points, t, point); }
  
    if (!client.showControlLine) return
  
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
          floor(client.customColor.x * 255),
          floor(client.customColor.y * 255),
          floor(client.customColor.z * 255)
        ),
        2,
        DASHLINESTYLE1
      );
  
      // prevent unneccessary triggering on first & last line(spline).
      if(client.line.isFirstLine(i) || client.line.isLastLine(i, points)) continue;
  
      if ( utils.linePointCollision(x1, y1, x2, y2, point.x, point.y)) {
        this.trigger();
        ControlLine1.draw(BLUE, 6);
      }
    }
  }
  
  // TODO: elaborate this.
  this.trigger = () => {
    const midiOutMsg = { note: "C", octave: 4, channel: 0, velocity: 16, length: 16}
    client.io.midi.push(
      midiOutMsg.channel, 
      midiOutMsg.octave, 
      midiOutMsg.note, 
      midiOutMsg.velocity, 
      midiOutMsg.length, 
      false 
    )
  }
  
  // casteljau's algorithm (cursived lerp)
  // P(t)=(1−t)A+tB
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
  
  this.drawRecursiveLine = (points, t, movingPoint) => {
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
            Math.floor(client.customRecursiveBezierColor.x * 255),
            Math.floor(client.customRecursiveBezierColor.y * 255),
            Math.floor(client.customRecursiveBezierColor.z * 255)
          ),
          0.5,
          DASHLINESTYLE4
        );
  
        // points along odd spline (left)
        if(client.showLPoints){
          client.circle.fillCircle({ x: x1, y: y1 }, POINTRADIUS, GRAY);
          if (utils.circleCircleCollision(x1,y1,POINTRADIUS,movingPoint.x,movingPoint.y, POINTRADIUS)){
            utils.throttle(this.trigger, 120);
            client.circle.fillCircle({ x: x1, y: y1 }, POINTRADIUS * 4, REDTRANSPARENT);
          }
        }
  
        // points along even spline (right)
        if(client.showRPoints){
          client.circle.fillCircle({ x: x2, y: y2 }, POINTRADIUS, GRAY);
          if (utils.circleCircleCollision(x2,y2,POINTRADIUS,movingPoint.x,movingPoint.y, POINTRADIUS)){
            utils.throttle(this.trigger, 120);
            client.circle.fillCircle({ x: x2, y: y2 }, POINTRADIUS * 4, ORANGETRANSPARENT);
          }
        }
      }
      return this.drawRecursiveLine(newpoints, t, movingPoint);
    }
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
      progress += client.stepSize;
    }
    client.context.stroke();
  }
  
}
