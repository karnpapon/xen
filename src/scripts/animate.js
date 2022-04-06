// shim with setTimeout fallback from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (/* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  DrawBezierSpline();

  // draw colored points on top of black points.
  for (
    var idx = DragPointStart;
    idx < DragPointStart + DragPointCount;
    ++idx
  ) {
    if (dragpoints[idx].color != BLACK) continue;
    FillCircle(dragpoints[idx], POINTRADIUS, dragpoints[idx].color);
    const text = `P${idx} (${dragpoints[idx].x},${dragpoints[idx].y})`
    DrawText(
      text,
      dragpoints[idx].x + POINTRADIUS,
      dragpoints[idx].y,
      dragpoints[idx].color
    );
  }
  // for (var idx = DragPointStart; idx < DragPointStart + DragPointCount; ++idx) {
  //   if (dragpoints[idx].color == BLACK)
  //     continue;
  //   FillCircle(dragpoints[idx], POINTRADIUS, dragpoints[idx].color);
  //   DrawText( "P" + idx, dragpoints[idx].x + POINTRADIUS, dragpoints[idx].y, dragpoints[idx].color );
  // }

  xOffset = 0;
  yOffset = 0;
}

function AnimationLoop() {
  if (ConstantAnimation) animate();
  requestAnimFrame(AnimationLoop);
}

function animBezier() {
  ConstantAnimation = true;
  RotationAngle = 0;
  MaxConstructionDescriptions = 0; // gets set later.
  ConstructionIndex = 0;

  animate();
}
