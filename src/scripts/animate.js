// shim with setTimeout fallback from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback, element) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBezierSpline();

  // draw colored points on top of black points.
  for (
    var idx = DragPointStart;
    idx < DragPointStart + DragPointCount;
    ++idx
  ) {
    if (dragpoints[idx].color != BLACK) continue;
    fillCircle(dragpoints[idx], POINTRADIUS, dragpoints[idx].color);
    const text = `P${idx} (${dragpoints[idx].x},${dragpoints[idx].y})`
    DrawText(
      text,
      dragpoints[idx].x + POINTRADIUS,
      dragpoints[idx].y,
      dragpoints[idx].color
    );
  }
  if (hover) {dragpoints[id].color = BLUE }
  // for (var idx = DragPointStart; idx < DragPointStart + DragPointCount; ++idx) {
  //   if (dragpoints[idx].color == BLACK)
  //     continue;
  //   fillCircle(dragpoints[idx], POINTRADIUS, dragpoints[idx].color);
  //   DrawText( "P" + idx, dragpoints[idx].x + POINTRADIUS, dragpoints[idx].y, dragpoints[idx].color );
  // }

  xOffset = 0;
  yOffset = 0;
  
}

function animationLoop() {
  if (ConstantAnimation) animate();
  requestAnimFrame(animationLoop);
}

function animBezier() {
  ConstantAnimation = true;
  RotationAngle = 0;
  MaxConstructionDescriptions = 0; // gets set later.
  ConstructionIndex = 0;

  animate();
}
