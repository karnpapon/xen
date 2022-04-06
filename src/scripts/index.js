function init() {
  canvas = document.getElementById("canvas");
  drawing = document.getElementById("drawing");

  canvas.onclick = (e) => {
    if (e.ctrlKey || e.metaKey) {
      MouseClick(e);
      return;
    }
  };
  canvas.onmousedown = ButtonDown;
  canvas.onmouseup = ButtonUp;
  canvas.onmousemove = MouseMove;

  timer = window.setInterval(function () {
    enableHandler = true;
  }, 10);

  if (canvas && canvas.getContext) {
    context = canvas.getContext("2d");

    window.addEventListener("resize", windowResizeHandler, false);
    windowResizeHandler();
  }

  animBezier();
  AnimationLoop();
}


init();
