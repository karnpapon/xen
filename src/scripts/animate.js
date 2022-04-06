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
  DrawSlowBezier();

  // draw colored points on top of black points.
  for (
    var Index = DragPointStart;
    Index < DragPointStart + DragPointCount;
    ++Index
  ) {
    if (dragpoints[Index].color != BLACK) continue;
    FillCircle(dragpoints[Index], POINTRADIUS, dragpoints[Index].color);
    DrawText(
      "P" + Index,
      dragpoints[Index].x + POINTRADIUS,
      dragpoints[Index].y,
      dragpoints[Index].color
    );
  }
  // for (var Index = DragPointStart; Index < DragPointStart + DragPointCount; ++Index) {
  //   if (dragpoints[Index].color == BLACK)
  //     continue;
  //   FillCircle(dragpoints[Index], POINTRADIUS, dragpoints[Index].color);
  //   // DrawText( "P" + Index, dragpoints[Index].x + POINTRADIUS, dragpoints[Index].y, dragpoints[Index].color );
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
