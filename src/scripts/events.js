function relativeCoordinates(X, Y) {
  var totalOffsetX = 0;
  var totalOffsetY = 0;
  var canvasX = 0;
  var canvasY = 0;
  // var currentElement = canvas;

  // do {
  //   totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
  //   totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
  // }
  // while (currentElement = currentElement.offsetParent)

  canvasX = X - totalOffsetX;
  canvasY = Y - totalOffsetY;

  return { x: X, y: Y };
}

function relMouseCoords(event) {
  if (event.offsetX !== undefined && event.offsetY !== undefined) {
    return { x: event.offsetX, y: event.offsetY };
  }

  return relativeCoordinates(event.pageX, event.pageY);
}

HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

function checkMouseOver(e, points) {
  // Get the current mouse position
  const xc = world.width / 2;
  const yc = world.height / 2;
  const newPoint = { x: e.offsetX - xc, y: e.offsetY - yc };
  let  x = newPoint.x;
  let  y = newPoint.y;
  hover = false;

  // context.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = points.length - 1, b; (b = points[i]); i--) {
    if (x >= b.x && x <= b.x + 8 && y >= b.y && y <= b.y + 8) {
      hover = true;
      id = i;
      break;
    }
  }
  // Draw the rectangles by Z (ASC)
  // animate();
}

function mouseMove(event) {
  if (!mouseDrag) return 
  position = canvas.relMouseCoords(event);
  dragMove(event);
}

function dragMove(event) {
  if (dragPoint >= 0) {
    var xc = world.width / 2;
    var yc = world.height / 2;

    var p = new Point(
      position.x - xc,
      position.y - yc,
      dragpoints.bezierPoints[dragPointGroup][dragPoint].color
    );

    xOffset = p.x - xOld;
    yOffset = p.y - yOld;
    xOld = p.x;
    yOld = p.y;

    xDrag = p.x - dragpoints.bezierPoints[dragPointGroup][dragPoint].x;
    yDrag = p.y - dragpoints.bezierPoints[dragPointGroup][dragPoint].y;

    dragpoints.bezierPoints[dragPointGroup][dragPoint].x = p.x;
    dragpoints.bezierPoints[dragPointGroup][dragPoint].y = p.y;

    //proportionalDistance = 0.0

    // animate();
  }
}

function mouseClick(e) {
  if (e.ctrlKey || e.metaKey) {
    handleAddPoint(e);
    return;
  }
}

function handleAddPoint(event) {
  const xc = world.width / 2;
  const yc = world.height / 2;
  const newPoint = { x: event.offsetX - xc, y: event.offsetY - yc };
  dragpoints.bezierPoints[dragPointGroup].push(new Point(newPoint.x, newPoint.y, BLACK));
  dragPointCount = dragpoints.bezierPoints[dragPointGroup].length;
}

function rightMouseClick(event) {
  event.preventDefault()
  position = canvas.relMouseCoords(event);

  if (position == null) return;
  const xc = world.width / 2;
  const yc = world.height / 2;

  const SearchRadius = POINTRADIUS;

  const p = new Point(position.x - xc, position.y - yc);
  xOffset = 0;
  yOffset = 0;

  for( let pIdx = 0; pIdx < dragpoints.bezierPoints.length; pIdx++ ){
    for (let idx = dragPointStart; idx < dragPointStart + dragPointCount; ++idx) {
      if (utils.distance(dragpoints.bezierPoints[pIdx][idx], p) < SearchRadius + 3) {
        removePoint(idx)
        return;
      }
    }
  }

  // dragPoint = -1;

}

function mouseDown(event) {
  position = canvas.relMouseCoords(event);
  mouseDrag = true;
  // pause = true;
  dragStart(event);
}

function dragStart(event) {
  if (position == null) return;

  const xc = world.width / 2;
  const yc = world.height / 2;

  const SearchRadius = POINTRADIUS;

  const p = new Point(position.x - xc, position.y - yc);
  xOld = p.x;
  yOld = p.y;
  xOffset = 0;
  yOffset = 0;

  
  for( let pIdx = 0; pIdx < dragpoints.bezierPoints.length; pIdx++ ){
    for (let idx = dragPointStart; idx < dragPointStart + dragPointCount; ++idx) {
      if (utils.distance(dragpoints.bezierPoints[dragPointGroup][idx], p) < SearchRadius + 3) {
        dragPoint = idx;
        xOffset = p.x - dragpoints.bezierPoints[dragPointGroup][dragPoint].x;
        yOffset = p.y - dragpoints.bezierPoints[dragPointGroup][dragPoint].y;
        return;
      }
    }
  }

  dragPoint = -1;
}

function mouseUp(event) {
  pause = false;
  if (!mouseDrag) return;

  dragEnd(event);
}

function dragEnd(event) {
  dragPoint = -1;
}

function windowResizeHandler() {
  // legend.style.height = window.innerHeight - 12 + "px";

  world.width = window.innerWidth - 258;
  world.height = window.innerHeight - 40;

  drawing.style.width = world.width + "px";
  drawing.style.height = world.height + "px";

  canvas.width = world.width;
  canvas.height = world.height;

  animate();
}


function playBtnClick(){
  pause = !pause
}