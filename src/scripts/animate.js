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
  
  // draw colored points on top of black points.
  for( let p = 0; p < dragpoints.bezierPoints.length; p++ ){

    drawBezierSpline(dragpoints.bezierPoints[p]);

    for ( var idx = dragPointStart; idx < dragPointStart + dragPointCount; ++idx) {
      if (!dragpoints.bezierPoints[p][idx]) continue;
      if (dragpoints.bezierPoints[p][idx].color != BLACK) continue;  
      fillCircle(dragpoints.bezierPoints[p][idx], POINTRADIUS, dragpoints.bezierPoints[p][idx].color);
      const text = `P${idx} (${dragpoints.bezierPoints[p][idx].x},${dragpoints.bezierPoints[p][idx].y})`
      DrawText(
        text,
        dragpoints.bezierPoints[p][idx].x + POINTRADIUS,
        dragpoints.bezierPoints[p][idx].y,
        dragpoints.bezierPoints[p][idx].color
      );
    }
    if (hover) {dragpoints.bezierPoints[0][id].color = BLUE }
  }

  if (!pause) {
    proportionalDistance += distSpeed;
    if (proportionalDistance > 1.0) {
      proportionalDistance = 0.0;
    }
  }
  
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
