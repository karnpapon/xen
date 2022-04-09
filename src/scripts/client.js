function Client() {
  mapSrc = document.getElementById("mapId");
  canvas = document.getElementById("canvas");
  drawing = document.getElementById("drawing");
  
  dragpoints = new BezierPoint()
  dragPointCount = dragpoints.bezierPoints[0].length // TODO: hardcoded

  initGUI()
  enableMidi()

  canvas.onclick = mouseClick;
  canvas.onmousedown = mouseDown;
  canvas.onmouseup = mouseUp;
  canvas.onmousemove = mouseMove;
  canvas.oncontextmenu = rightMouseClick;
  canvas.addEventListener('toggleMap', function (e) {
    mapSrc.style.display = e.detail.hideMap ? "none" : "block"
  });

  if (canvas && canvas.getContext) {
    context = canvas.getContext("2d");
    window.addEventListener("resize", windowResizeHandler, false);
    windowResizeHandler();
  }

  animBezier();
  animationLoop();
}





