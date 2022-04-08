var floor = Math.floor;
var random = Math.random;
var sin = Math.sin;
var asin = Math.asin;
var cos = Math.cos;
var atan2 = Math.atan2;
var PI = Math.PI;
var PI2 = PI * 2;
var sqrt = Math.sqrt;
var min = Math.min;
var max = Math.max;
var abs = Math.abs;
var Position = null;
var FingerDrag = false;
var MouseDrag = false;

var BLUE = utils.makeRGB(0, 0, 255);
var GREEN = utils.makeRGB(120, 255, 120);
var RED = utils.makeRGB(255, 0, 0);
var GOLD = utils.makeRGB(255,215,0);
var BOLDRED = utils.makeRGB(255, 64, 64);
var ORANGE = utils.makeRGB(255,140,0);
var YELLOW =utils.makeRGB(232, 215, 100);
var WHITE = utils.makeRGB(255, 255, 255);

var COLORS = [  RED, GREEN]

var POINTRADIUS = 4;
var BLACK = utils.makeRGB(0.0, 0.0, 0.0);
var GRAY = utils.makeRGB(150, 150, 150);
var LIGHTGRAY = utils.makeRGB(220, 220, 220);

var pinCount = 1;
var slotCount = 4;

var MaxConstructionDescriptions = 0;

var RotationAngle = 0;
var ProportionalDistance = 0.0;
var distSpeed = 0.0;
var ConstantAnimation = false;
var Pause = false;

var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;

var dragpoints = new Array(
  new Point(-100, 0, BLACK),
  new Point(-220, -100, BLACK),
  new Point(50, -165, BLACK),
  new Point(50, 0, BLACK)
);

var DragPointStart = 0;
var DragPointCount = 4;
var DragPoint = -1;
var xDrag = 0;
var yDrag = 0;
var xOld = 0;
var yOld = 0;
var xOffset = 0;
var yOffset = 0;
var hover = false, id;

var stepSize = 0.001;
var dashedLineStyle1 = [2, 2]
var dashedLineStyle2 = [10, 10]
var dashedLineStyle3 = [15, 3, 3, 3]

var canvas;
var drawing;
var context;

var DoCreate = false;
var lastTime = new Date().getTime();
var timeScale = 1;

var enableHandler = true;
var midi = ""

var mapSrc;
var hideMap = false;
var dispatchToggleMap = false;

var customColor = {x:0.45, y:0.55, z:0.60, w:1.00};
var customRecursiveBezierColor = {x:0.77, y:0.67, z:1.00, w:1.00};

world = { width: 0, height: 0 };