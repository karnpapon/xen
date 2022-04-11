function Circle(x, y, r) {

  if (typeof x == "object") {
    if (!x && !x.x && !x.y && !x.r) {
      return
    }
    this.x = x.x;
    this.y = x.y;
    this.r = x.r;
    return
  }

  if (!x && !y && !r) {
    this.x = 0
    this.y = 0
    this.r = 0
    return
  }

  this.x = x
  this.y = y
  this.r = r
}

Circle.prototype.draw = function (Color, LineWidth) {
  var xc = world.width / 2;
  var yc = world.height / 2;
  context.strokeStyle = Color;
  context.lineWidth = 0.8;
  if (LineWidth > 1) context.lineWidth += 0.7 * (LineWidth - 1);
  context.beginPath();
  context.arc(xc + this.x, yc + this.y, this.r, 0, Math.PI * 2, false);
  context.stroke();
};

Circle.prototype.fill = function (Color) {
  var xc = world.width / 2;
  var yc = world.height / 2;
  context.strokeStyle = Color;
  context.fillStyle = Color;
  context.setLineDash([]);
  context.lineWidth = 0.8;
  if (Color == BLACK) context.lineWidth = 1.5;
  context.beginPath();
  context.arc(xc + this.x, yc + this.y, this.r, 0, Math.PI * 2, false);
  context.stroke();
  context.fill();
};


function fillCircle(point, radius, Color) {
  circle = new Circle(point.x, point.y, radius);
  circle.fill(Color);
}

function drawCircle(point, radius, Color, lineWidth) {
  circle = new Circle(point.x, point.y, radius);
  circle.draw(Color, lineWidth);
}