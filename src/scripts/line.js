function Line(x1, y1, x2, y2) {
  if (
    x1 != undefined &&
    x1 != null &&
    y1 != undefined &&
    y1 != null &&
    x2 != undefined &&
    x2 != null &&
    y2 != undefined &&
    y2 != null
  ) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  } else {
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
  }
}

Line.prototype.draw = function (color, width, dashed = []) {
  var xc = world.width / 2;
  var yc = world.height / 2;
  context.strokeStyle = color;
  context.setLineDash(dashed);
  if (width == undefined || width == null) {
    width = 0.8;
    if (color == BLACK) width = 1.5;
  }
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(xc + this.x1, yc + this.y1);
  context.lineTo(xc + this.x2, yc + this.y2);
  context.stroke();
};


Line.prototype.start = function () {
  return new Point(this.x1, this.y1);
};

Line.prototype.end = function () {
  return new Point(this.x2, this.y2);
};

Line.prototype.SetLength = function (NewLength) {
  var dx = this.x2 - this.x1;
  var dy = this.y2 - this.y1;
  var length = sqrt(dx * dx + dy * dy);
  var Ratio = NewLength / length;
  dx *= Ratio;
  dy *= Ratio;
  this.x2 = this.x1 + dx;
  this.y2 = this.y1 + dy;
};

Line.prototype.extend = function (Add) {
  var dx = this.x2 - this.x1;
  var dy = this.y2 - this.y1;
  var length = sqrt(dx * dx + dy * dy);
  var Ratio = (length + Add) / length;
  dx *= Ratio;
  dy *= Ratio;
  this.x2 = this.x1 + dx;
  this.y2 = this.y1 + dy;
  this.x1 = this.x2 - dx * 2;
  this.y1 = this.y2 - dy * 2;
};

Line.prototype.move = function (point) {
  var Temp = moveLine(this, point);
  this.x1 = Temp.x1;
  this.y1 = Temp.y1;
  this.x2 = Temp.x2;
  this.y2 = Temp.y2;
};


Line.prototype.length = function () {
  var dx = abs(this.x1 - this.x2);
  var dy = abs(this.y1 - this.y2);
  return sqrt(dx * dx + dy * dy);
};

Line.prototype.reverse = function () {
  var tx = this.x2;
  var ty = this.y2;
  this.x2 = this.x1;
  this.y2 = this.y1;
  this.x1 = tx;
  this.y1 = ty;
};


function moveLine(line, point) {
  var newline = new Line();
  newline.x2 = line.x2 - line.x1 + point.x;
  newline.y2 = line.y2 - line.y1 + point.y;
  newline.x1 = point.x;
  newline.y1 = point.y;
  return newline;
}