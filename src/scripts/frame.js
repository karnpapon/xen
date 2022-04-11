// shim with setTimeout fallback from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// window.requestAnimFrame = (function () {
//   return (
//     window.requestAnimationFrame ||
//     window.webkitRequestAnimationFrame ||
//     window.mozRequestAnimationFrame ||
//     window.oRequestAnimationFrame ||
//     window.msRequestAnimationFrame ||
//     function (callback, element) {
//       window.setTimeout(callback, 1000 / 60);
//     }
//   );
// })();


function Frame(client){

  this.f = 0 // Frame

  this.run = function () {
    // this.runtime = this.parse()
    // this.operate(this.runtime)
    this.f += 1
    // console.log("f run", this.f)
  }

  this.reset = function () {
    this.f = 0
  }

  this.animate = () => {
    client.drawer.drawBezier()
    client.xOffset = 0;
    client.yOffset = 0;
  }
  
  // this.animationLoop = () => {
  //   // this.animate();
  //   // window.requestAnimationFrame(this.animationLoop);
  // }
  
  // this.animBezier = function(){
  //   this.animate();
  // }

  this.update = () => {
    this.animate()
    // this.animationLoop()
  }
  
}
