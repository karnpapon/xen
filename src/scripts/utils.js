var throttleTimer;
var utils = {
  norm: function (value, min, max) {
    return (value - min) / (max - min);
  },

  lerp: function (norm, min, max) {
    return (max - min) * norm + min;
  },

  map: function (value, sourceMin, sourceMax, destMin, destMax) {
    return utils.lerp(
      utils.norm(value, sourceMin, sourceMax),
      destMin,
      destMax
    );
  },

  clamp: function (value, min, max) {
    return MIN(MAX(value, MIN(min, max)), MAX(min, max));
  },

  mod: function(n, m) {
    return ((n % m) + m) % m;
  },

  dist: function (x0, y0, x1, y1) {
    var dx = x1 - x0,
      dy = y1 - y0;
    return SQRT(dx * dx + dy * dy);
  },

  circleCollision: function (c0, c1) {
    return utils.distance(c0, c1) <= c0.radius + c1.radius;
  },

  circlePointCollision: function (x, y, circle) {
    return utils.distanceXY(x, y, circle.x, circle.y) < circle.radius;
  },

  pointInRect: function (x, y, rect) {
    return (
      utils.inRange(x, rect.x, rect.x + rect.width) &&
      utils.inRange(y, rect.y, rect.y + rect.height)
    );
  },

  inRange: function (value, min, max) {
    return value >= MIN(min, max) && value <= MAX(min, max);
  },

  rangeIntersect: function (min0, max0, min1, max1) {
    return (
      MAX(min0, max0) >= MIN(min1, max1) &&
      MIN(min0, max0) <= MAX(min1, max1)
    );
  },

  rectIntersect: function (r0, r1) {
    return (
      utils.rangeIntersect(r0.x, r0.x + r0.width, r1.x, r1.x + r1.width) &&
      utils.rangeIntersect(r0.y, r0.y + r0.height, r1.y, r1.y + r1.height)
    );
  },

  degreesToRads: function (degrees) {
    return (degrees / 180) * Math.PI;
  },

  radsToDegrees: function (radians) {
    return (radians * 180) / Math.PI;
  },

  randomRange: function (min, max) {
    return min + RANDOM() * (max - min);
  },

  randomInt: function (min, max) {
    return FLOOR(min + RANDOM() * (max - min + 1));
  },

  roundToPlaces: function (value, places) {
    var mult = Math.pow(10, places);
    return Math.round(value * mult) / mult;
  },

  roundNearest: function (value, nearest) {
    return Math.round(value / nearest) * nearest;
  },

  quadraticBezier: function (p0, p1, p2, t, pFinal) {
    pFinal = pFinal || {};
    pFinal.x =
      Math.pow(1 - t, 2) * p0.x + (1 - t) * 2 * t * p1.x + t * t * p2.x;
    pFinal.y =
      Math.pow(1 - t, 2) * p0.y + (1 - t) * 2 * t * p1.y + t * t * p2.y;
    return pFinal;
  },

  cubicBezier: function (p0, p1, p2, p3, t, pFinal) {
    pFinal = pFinal || {};
    pFinal.x =
      Math.pow(1 - t, 3) * p0.x +
      Math.pow(1 - t, 2) * 3 * t * p1.x +
      (1 - t) * 3 * t * t * p2.x +
      t * t * t * p3.x;
    pFinal.y =
      Math.pow(1 - t, 3) * p0.y +
      Math.pow(1 - t, 2) * 3 * t * p1.y +
      (1 - t) * 3 * t * t * p2.y +
      t * t * t * p3.y;
    return pFinal;
  },

  randomInt: function (minimum, maximum) {
    if (minimum == undefined || maximum == undefined) return 0;
    var temp = maximum - minimum;
    temp += 0.9999999;
    return minimum + FLOOR(RANDOM() * temp);
  },

  makeRGBA: function (r, g, b, a) {
    return (
      "rgba( " +
      FLOOR(r) +
      "," +
      FLOOR(g) +
      "," +
      FLOOR(b) +
      "," +
      a.toFixed(8) +
      " )"
    );
  },

  makeRGB: function (r, g, b) {
    return "rgb( " + FLOOR(r) + "," + FLOOR(g) + "," + FLOOR(b) + " )";
  },

  distance: function (point1, point2) {
    if(!point1 || !point2) return 
    const dx = ABS(point1.x - point2.x);
    const dy = ABS(point1.y - point2.y);
    return SQRT(dx * dx + dy * dy);
  },

  linePointCollision: function (x1, y1, x2, y2, px, py) {
    // get distance from the point to the two ends of the line
    const d1 = this.dist(px, py, x1, y1);
    const d2 = this.dist(px, py, x2, y2);
    const lineLen = this.dist(x1, y1, x2, y2);

    // since floats are so minutely accurate, add
    // a little buffer zone that will give collision
    const buffer = 0.1; // higher # = less accurate

    // if the two distances are equal to the line's
    // length, the point is on the line!
    // note we use the buffer here to give a range,
    // rather than one #
    if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
      return true;
    }
    return false;
  },

  pointPointCollision(x1, y1, x2, y2) {
    if (x1 == x2 && y1 == y2) {
      return true;
    }
    return false;
  },

  circleCircleCollision(c1x, c1y, c1r, c2x, c2y, c2r) {
    // get distance between the circle's centers
    // use the Pythagorean Theorem to compute the distance
    distX = c1x - c2x;
    distY = c1y - c2y;
    distance = SQRT(distX * distX + distY * distY);

    // if the distance is less than the sum of the circle's
    // radii, the circles are touching!
    if (distance <= c1r + c2r) {
      return true;
    }
    return false;
  },

  throttle: function (callback, time) {
    if (throttleTimer) return;
    throttleTimer = true;
    setTimeout(() => {
      callback();
      throttleTimer = false;
    }, time);
  },
};
