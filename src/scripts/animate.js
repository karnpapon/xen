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
    var idx = dragPointStart;
    idx < dragPointStart + dragPointCount;
    ++idx
  ) {
    if (dragpoints.bezierPoints[0][idx].color != BLACK) continue;
    fillCircle(dragpoints.bezierPoints[0][idx], POINTRADIUS, dragpoints.bezierPoints[0][idx].color);
    const text = `P${idx} (${dragpoints.bezierPoints[0][idx].x},${dragpoints.bezierPoints[0][idx].y})`
    DrawText(
      text,
      dragpoints.bezierPoints[0][idx].x + POINTRADIUS,
      dragpoints.bezierPoints[0][idx].y,
      dragpoints.bezierPoints[0][idx].color
    );
  }
  if (hover) {dragpoints.bezierPoints[0][id].color = BLUE }
  // for (var idx = dragPointStart; idx < dragPointStart + dragPointCount; ++idx) {
  //   if (dragpoints.bezierPoints[0][idx].color == BLACK)
  //     continue;
  //   fillCircle(dragpoints.bezierPoints[0][idx], POINTRADIUS, dragpoints.bezierPoints[0][idx].color);
  //   DrawText( "P" + idx, dragpoints.bezierPoints[0][idx].x + POINTRADIUS, dragpoints.bezierPoints[0][idx].y, dragpoints.bezierPoints[0][idx].color );
  // }

  xOffset = 0;
  yOffset = 0;
  
}

function animationLoop() {
  if (constantAnimation) animate();
  requestAnimFrame(animationLoop);
}

function animBezier() {
  constantAnimation = true;
  ConstructionIndex = 0;

  animate();
}
