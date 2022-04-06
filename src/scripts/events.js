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


function MouseMove(event) {
  if (!MouseDrag) return;
  Position = canvas.relMouseCoords(event);
  DragMove(event);
}

function DragMove(event) {
  if (DragPoint >= 0) {
    var xc = world.width / 2;
    var yc = world.height / 2;

    var p = new Point(
      Position.x - xc,
      Position.y - yc,
      dragpoints[DragPoint].color
    );

    xOffset = p.x - xOld;
    yOffset = p.y - yOld;
    xOld = p.x;
    yOld = p.y;

    xDrag = p.x - dragpoints[DragPoint].x;
    yDrag = p.y - dragpoints[DragPoint].y;

    dragpoints[DragPoint].x = p.x;
    dragpoints[DragPoint].y = p.y;

    //ProportionalDistance = 0.0

    animate();
  }
}

function MouseClick(event) {
  const xc = world.width / 2;
  const yc = world.height / 2;

  const newPoint = { x: event.offsetX - xc, y: event.offsetY - yc };

  dragpoints.push(new Point(newPoint.x, newPoint.y, BLACK));
  DragPointCount = dragpoints.length;
}

function ButtonDown(event) {
  Position = canvas.relMouseCoords(event);
  MouseDrag = true;
  Pause = true;
  DragStart(event, false);
}

function DragStart(event, Fingers) {
  if (Position == null) return;

  var xc = world.width / 2;
  var yc = world.height / 2;

  var SearchRadius = POINTRADIUS;
  if (Fingers) SearchRadius *= 4;

  var p = new Point(Position.x - xc, Position.y - yc);
  xOld = p.x;
  yOld = p.y;
  xOffset = 0;
  yOffset = 0;
  for (
    var Index = DragPointStart;
    Index < DragPointStart + DragPointCount;
    ++Index
  ) {
    // The first time through, look only for black points. This
    // is based on the assumption that black points are control
    // points and that they need to be checked first!
    if (dragpoints[Index].color == BLACK) continue;
    if (utils.distance(dragpoints[Index], p) < SearchRadius + 3) {
      DragPoint = Index;
      xOffset = p.x - dragpoints[DragPoint].x;
      yOffset = p.y - dragpoints[DragPoint].y;
      animate();
      return;
    }
  }
  for (
    var Index = DragPointStart;
    Index < DragPointStart + DragPointCount;
    ++Index
  ) {
    if (utils.distance(dragpoints[Index], p) < SearchRadius + 3) {
      DragPoint = Index;
      xOffset = p.x - dragpoints[DragPoint].x;
      yOffset = p.y - dragpoints[DragPoint].y;
      animate();
      return;
    }
  }
  DragPoint = -1;
}

function ButtonUp(event) {
  Pause = false;
  if (!MouseDrag) return;

  DragEnd(event);
}

function DragEnd(event) {
  DragPoint = -1;
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