/* global world */
/* global client */
/* global BLACK */

function Circle(client) {

  this.new = (x, y, r) => {
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

    return this
  }
}

Circle.prototype.draw = function(Color, LineWidth) {
  var xc = world.width / 2;
  var yc = world.height / 2;
  client.context.strokeStyle = Color;
  client.context.lineWidth = 0.8;
  if (LineWidth > 1) client.context.lineWidth += 0.7 * (LineWidth - 1);
  client.context.beginPath();
  client.context.arc(xc + this.x, yc + this.y, this.r, 0, Math.PI * 2, false);
  client.context.stroke();
};

Circle.prototype.fill = function(Color) {
  var xc = world.width / 2;
  var yc = world.height / 2;
  client.context.strokeStyle = Color;
  client.context.fillStyle = Color;
  client.context.setLineDash([]);
  client.context.lineWidth = 0.8;
  if (Color == BLACK) client.context.lineWidth = 1.5;
  client.context.beginPath();
  client.context.arc(xc + this.x, yc + this.y, this.r, 0, Math.PI * 2, false);
  client.context.stroke();
  client.context.fill();
};

Circle.prototype.fillCircle = function(point, radius, Color) {
  let circle = this.new(point.x, point.y, radius);
  circle.fill(Color);
}

Circle.prototype.drawCircle = function(point, radius, Color, lineWidth) {
  let circle = this.new(point.x, point.y, radius);
  circle.draw(Color, lineWidth);
}
