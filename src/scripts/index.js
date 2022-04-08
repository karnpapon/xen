function init() {
  mapSrc = document.getElementById("mapId");
  canvas = document.getElementById("canvas");
  drawing = document.getElementById("drawing");

  initGUI()
  enableMidi()

  canvas.onclick = mouseClick;
  canvas.onmousedown = buttonDown;
  canvas.onmouseup = buttonUp;
  canvas.onmousemove = mouseMove;
  canvas.oncontextmenu = rightMouseClick;
  canvas.addEventListener('toggleMap', function (e) {
    mapSrc.style.display = e.detail.hideMap ? "none" : "block"
  });

  timer = window.setInterval(function () {
    enableHandler = true;
  }, 10);

  if (canvas && canvas.getContext) {
    context = canvas.getContext("2d");
    window.addEventListener("resize", windowResizeHandler, false);
    windowResizeHandler();
  }

  animBezier();
  animationLoop();
}

init();


