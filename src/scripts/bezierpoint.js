function BezierPoint() {
  this.bezierPoints = new Array(
    new Array(new Point(100, 0, BLACK), new Point(266, -135, BLACK)),
    new Array( new Point(50, -165, BLACK), new Point(50, 0, BLACK)));
}

BezierPoint.prototype.addNewBezierPointGroup = function (x, y) {};
