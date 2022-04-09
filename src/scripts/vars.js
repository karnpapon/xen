//--------------------------------------
//                TBD
//--------------------------------------

let stepSize = 0.001;
let proportionalDistance = [];
let distanceSpeed = 0.004;
let constantAnimation = false;
let pause = false;

let dragpoints = {};

world = { width: 0, height: 0 };

//--------------------------------------
//                GLOBAL
//--------------------------------------

let canvas;
let drawing;
let context;

const floor = Math.floor;
const random = Math.random;
const sin = Math.sin;
const asin = Math.asin;
const cos = Math.cos;
const atan2 = Math.atan2;
const PI = Math.PI;
const PI2 = PI * 2;
const sqrt = Math.sqrt;
const min = Math.min;
const max = Math.max;
const abs = Math.abs;

const BLUE = utils.makeRGB(0, 0, 255);
const GREEN = utils.makeRGB(120, 255, 120);
const RED = utils.makeRGB(255, 0, 0);
const GOLD = utils.makeRGB(255,215,0);
const BOLDRED = utils.makeRGB(255, 64, 64);
const ORANGE = utils.makeRGB(255,140,0);
const YELLOW =utils.makeRGB(232, 215, 100);
const WHITE = utils.makeRGB(255, 255, 255);
const BLACK = utils.makeRGB(0.0, 0.0, 0.0);
const BLACKTRANSPARENT = utils.makeRGBA(0.0, 0.0, 0.0, 0.25)
const REDTRANSPARENT = utils.makeRGBA(255, 0.0, 0.0, 0.5)
const ORANGETRANSPARENT = utils.makeRGBA(0,0,255, 0.5)
const GRAY = utils.makeRGB(192,192,192);
const LIGHTGRAY = utils.makeRGB(220, 220, 220);
const COLORS = [RED, GREEN]

const POINTRADIUS = 4;

const DASHLINESTYLE1 = [2, 2]
const DASHLINESTYLE2 = [10, 10]
const DASHLINESTYLE3 = [15, 3, 3, 3]
const DASHLINESTYLE4 = [4, 4]

let MIDI = ""
let show_sandbox_window = false
let addNewPointGroup = false;

//--------------------------------------
//                LOCAL
//--------------------------------------

let position = null;
let mouseDrag = false;

let showLPoints = false;
let showRPoints = false;
let showControlLine = true;

let dragPointStart = 0;
let dragPointGroup = 0;
let dragPointCount = 0;
let dragPoint = -1;
let xDrag = 0;
let yDrag = 0;
let xOld = 0;
let yOld = 0;
let xOffset = 0;
let yOffset = 0;
let hover = false, id;

let mapSrc;
let hideMap = true;
let dispatchToggleMap = false;

// ImGui
let customColor = {x:0.45, y:0.55, z:0.60, w:1.00};
let customRecursiveBezierColor = {x:0.77, y:0.67, z:1.00, w:1.00};

// let enableHandler = true;

