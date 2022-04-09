//--------------------------------------
//                TBD
//--------------------------------------

var stepSize = 0.001;
var proportionalDistance = 0.0;
var distSpeed = 0.0;
var constantAnimation = false;
var pause = false;

var dragpoints = {};

// var dragpoints2 = new Array(
//   // new Point(-100, 0, BLACK),
//   // new Point(-220, -100, BLACK),
//   new Point(50, -165, BLACK),
//   new Point(50, 0, BLACK)
// );

world = { width: 0, height: 0 };

//--------------------------------------
//                GLOBAL
//--------------------------------------

var canvas;
var drawing;
var context;

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

var BLUE = utils.makeRGB(0, 0, 255);
var GREEN = utils.makeRGB(120, 255, 120);
var RED = utils.makeRGB(255, 0, 0);
var GOLD = utils.makeRGB(255,215,0);
var BOLDRED = utils.makeRGB(255, 64, 64);
var ORANGE = utils.makeRGB(255,140,0);
var YELLOW =utils.makeRGB(232, 215, 100);
var WHITE = utils.makeRGB(255, 255, 255);
var BLACK = utils.makeRGB(0.0, 0.0, 0.0);
var BLACKTRANSPARENT = utils.makeRGBA(0.0, 0.0, 0.0, 0.25)
var REDTRANSPARENT = utils.makeRGBA(255, 0.0, 0.0, 0.5)
var ORANGETRANSPARENT = utils.makeRGBA(0,0,255, 0.5)
var GRAY = utils.makeRGB(192,192,192);
var LIGHTGRAY = utils.makeRGB(220, 220, 220);
var COLORS = [RED, GREEN]

var POINTRADIUS = 4;

var DASHLINESTYLE1 = [2, 2]
var DASHLINESTYLE2 = [10, 10]
var DASHLINESTYLE3 = [15, 3, 3, 3]
var DASHLINESTYLE4 = [4, 4]

var MIDI = ""
var show_sandbox_window = false
var addNewPointGroup = false;

//--------------------------------------
//                LOCAL
//--------------------------------------

var position = null;
var mouseDrag = false;

var showLPoints = false;
var showRPoints = false;
var showControlLine = true;

var dragPointStart = 0;
var dragPointGroup = 0;
var dragPointCount = 0;
var dragPoint = -1;
var xDrag = 0;
var yDrag = 0;
var xOld = 0;
var yOld = 0;
var xOffset = 0;
var yOffset = 0;
var hover = false, id;

var mapSrc;
var hideMap = true;
var dispatchToggleMap = false;

// ImGui
var customColor = {x:0.45, y:0.55, z:0.60, w:1.00};
var customRecursiveBezierColor = {x:0.77, y:0.67, z:1.00, w:1.00};

// var enableHandler = true;

