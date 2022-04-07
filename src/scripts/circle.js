function Circle(x, y, r) {
  if (typeof x == "object") {
    if (
      x != undefined &&
      x != null &&
      x.x != undefined &&
      x.x != null &&
      x.y != undefined &&
      x.y != null &&
      x.r != undefined &&
      x.r != null
    ) {
      this.x = x.x;
      this.y = x.y;
      this.r = x.r;
    }
  } else {
    if (
      x != undefined &&
      x != null &&
      y != undefined &&
      y != null &&
      r != undefined &&
      r != null
    ) {
      this.x = x;
      this.y = y;
      this.r = r;
    } else {
      this.x = 0;
      this.y = 0;
      this.r = 0;
    }
  }
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