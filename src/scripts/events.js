/* global world */
/* global Point */
/* global utils */
/* global POINTRADIUS */
/* global BLACK */

function Events(client) {
  

  this.start = () => {
    document.onclick = this.mouseClick;
    document.onmousedown = this.mouseDown;
    document.onmouseup = this.mouseUp;
    document.onmousemove = this.mouseMove;
    document.oncontextmenu = this.rightMouseClick;
    document.onkeydown = this.onKeyPressed;
    document.addEventListener('toggleMap', function (e) {
    client.mapSrc.style.display = e.detail.hideMap ? "none" : "block"
  });
  }
  
  this.relMouseCoords = (event) => {
    if (event.offsetX !== undefined && event.offsetY !== undefined) {
      return { x: event.offsetX, y: event.offsetY };
    }
  
    return this.relativeCoordinates(event.pageX, event.pageY);
  }

  this.relativeCoordinates = (X, Y) => {
    return { x: X, y: Y };
  }
  
  // this.checkMouseOver = (e, points) => {
  //   // Get the current mouse position
  //   const xc = world.width / 2;
  //   const yc = world.height / 2;
  //   const newPoint = { x: e.offsetX - xc, y: e.offsetY - yc };
  //   let  x = newPoint.x;
  //   let  y = newPoint.y;
  //   hover = false;
  
  //   // context.clearRect(0, 0, canvas.width, canvas.height);
  
  //   for (let i = points.length - 1, b; (b = points[i]); i--) {
  //     if (x >= b.x && x <= b.x + 8 && y >= b.y && y <= b.y + 8) {
  //       hover = true;
  //       id = i;
  //       break;
  //     }
  //   }
  //   // Draw the rectangles by Z (ASC)
  //   // animate();
  // }
  
  this.mouseMove = (event) => {
    if (!client.mouseDrag) return 
    client.position = this.relMouseCoords(event);
    this.dragMove(event);
  }
  
  this.handleAddPoint = (event) => {
    const xc = world.width / 2;
    const yc = world.height / 2;
    const newPoint = { x: event.offsetX - xc, y: event.offsetY - yc };
    client.dragpoints.bezierPoints[client.dragPointGroup]["points"].push(new Point(newPoint.x, newPoint.y, BLACK));
    client.dragPointCount = client.dragpoints.bezierPoints[client.dragPointGroup]["points"].length; 
  }
  
  this.mouseDown = (event) => {
    client.position = this.relMouseCoords(event);
    client.mouseDrag = true;
    // pause = true;
    this.dragStart(event);
  }
  
  this.mouseUp = (event) => {
    if (!client.mouseDrag) return;
  
    this.dragEnd(event);
  }

  this.dragStart = (event) => {
    if (client.position == null) return;
    
    const xc = world.width / 2;
    const yc = world.height / 2;
    
    const SearchRadius = POINTRADIUS;
    
    const p = new Point(client.position.x - xc, client.position.y - yc);
    client.xOld = p.x;
    client.yOld = p.y;
    client.xOffset = 0;
    client.yOffset = 0;
    
    for( let pIdx = 0; pIdx < client.dragpoints.bezierPoints.length; pIdx++ ){
      for (let idx = client.dragPointStart; idx - 1 < client.dragPointStart + client.dragPointCount; ++idx) {
        if (utils.distance(client.dragpoints.bezierPoints[client.dragPointGroup]["points"][idx], p) < SearchRadius + 3) {
          client.dragPoint = idx;
          client.xOffset = p.x - client.dragpoints.bezierPoints[client.dragPointGroup]["points"][client.dragPoint].x;
          client.yOffset = p.y - client.dragpoints.bezierPoints[client.dragPointGroup]["points"][client.dragPoint].y;
          return;
        }
      }
    }
  
    client.dragPoint = -1;
  }

  this.dragMove = (event) => {
    if (client.dragPoint >= 0) {
      var xc = world.width / 2;
      var yc = world.height / 2;
  
      var p = new Point(
        client.position.x - xc,
        client.position.y - yc,
        client.dragpoints.bezierPoints[client.dragPointGroup]["points"][client.dragPoint].color
      );
  
      client.xOffset = p.x - client.xOld;
      client.yOffset = p.y - client.yOld;
      client.xOld = p.x;
      client.yOld = p.y;
  
      client.xDrag = p.x - client.dragpoints.bezierPoints[client.dragPointGroup]["points"][client.dragPoint].x;
      client.yDrag = p.y - client.dragpoints.bezierPoints[client.dragPointGroup]["points"][client.dragPoint].y;
  
      client.dragpoints.bezierPoints[client.dragPointGroup]["points"][client.dragPoint].x = p.x;
      client.dragpoints.bezierPoints[client.dragPointGroup]["points"][client.dragPoint].y = p.y;
  
    }
  }

  this.dragEnd = (event) => {
    client.dragPoint = -1;
    client.mouseDrag = false
  }
  
  this.playBtnClick = () => {
    client.clock.togglePlay()
  }
  
  this.mouseClick = (e) => {
    if (e.ctrlKey || e.metaKey) {
      this.handleAddPoint(e);
      return;
    }
  }

  this.rightMouseClick = (event) => {
    event.preventDefault()
  
    if(client.dragpoints.bezierPoints[client.dragPointGroup]["points"].length<= 2) return
    
    client.position = this.relMouseCoords(event);
    
    if (client.position == null) return;
    const xc = world.width / 2;
    const yc = world.height / 2;
    
    const SearchRadius = POINTRADIUS;
    
    const p = new Point(client.position.x - xc, client.position.y - yc);
    client.xOffset = 0;
    client.yOffset = 0;
  
    for( let pIdx = 0; pIdx < client.dragpoints.bezierPoints.length; pIdx++ ){
      for (let idx = client.dragPointStart; idx - 1 < client.dragPointStart + client.dragPointCount; ++idx) {
        if (utils.distance(client.dragpoints.bezierPoints[client.dragPointGroup]["points"][idx], p) < SearchRadius + 3) {
          client.dragpoints.bezierPoints[client.dragPointGroup]["points"].splice(idx, 1)
          return;
        }
      }
    }
  
    client.dragPoint = -1;
  
  }

  this.onKeyPressed = (event) => {
    const e = event
    const { clock,  dragpoints: { bezierPoints } } = client
    let { dragPointGroup } = client

    // TODO: handle modern browser
    const charCode = e.which || e.key;
  
    // TAB = switch between point group
    if (charCode === 9 ) { client.dragPointGroup = (dragPointGroup + 1) % bezierPoints.length }
  
    // SPACEBAR = play/pause
    if (charCode == 32) { clock.togglePlay() }

    // Shift + C = toggle all control line
    if (e.shiftKey) {
      if (charCode == 67) { bezierPoints.map(bp => toggleGroup(bp["toggle"], "showControlLine")) }
    } 

    // c = toggle c points
    if (event.key === 'c') { toggleGroup(bezierPoints[dragPointGroup]["toggle"], "showControlLine") }

    // l = toggle l points
    if (event.key === 'l') { toggleGroup(bezierPoints[dragPointGroup]["toggle"], "showLPoints") }

    // shift + L = toggle all L points
    if (e.shiftKey) {
      if (charCode == 76) { bezierPoints.map(bp => toggleGroup(bp["toggle"], "showLPoints")) }
    } 

    // r = toggle r points
    if (event.key === 'r') { toggleGroup(bezierPoints[dragPointGroup]["toggle"], "showRPoints") }

    // shift + R = toggle all R points
    if (e.shiftKey) {
      if (charCode == 82) { bezierPoints.map(bp => toggleGroup(bp["toggle"], "showRPoints")) }
    } 

    // Shift + L = new point group
    if (e.shiftKey) {
      if (charCode == 78) { client.dragpoints.spawnNewGroup() }
    } 
  
  };
}


function toggleGroup(points, type){
  points[type] = !points[type]
}
