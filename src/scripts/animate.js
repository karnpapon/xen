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
  
  drawBezier()

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
