function init() {
  canvas = document.getElementById("canvas");
  drawing = document.getElementById("drawing");
  btn = document.getElementById("play-btn");


  btn.onclick = playBtnClick;

  canvas.onclick = (e) => {
    if (e.ctrlKey || e.metaKey) {
      mouseClick(e);
      return;
    }
  };
  canvas.onmousedown = buttonDown;
  canvas.onmouseup = buttonUp;
  canvas.onmousemove = mouseMove;
  canvas.oncontextmenu = rightMouseClick;

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
