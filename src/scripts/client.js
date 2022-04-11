function Client() {
  this.stepSize = 0.001;
  this.proportionalDistance = [];
  this.distanceSpeed = 0.02;
  this.pause = false;

  this.dragpoints = {};

  this.MIDI = ""
  this.showSandboxWindow = false
  this.addNewPointGroup = false;

  this.position = null;
  this.mouseDrag = false;

  this.showLPoints = false;
  this.showRPoints = false;
  this.showControlLine = true;

  this.dragPointStart = 0;
  this.dragPointGroup = 0;
  this.dragPointCount = 0;
  this.dragPoint = -1;
  this.xDrag = 0;
  this.yDrag = 0;
  this.xOld = 0;
  this.yOld = 0;
  this.xOffset = 0;
  this.yOffset = 0;
  this.hover = false;

  this.mapSrc;
  this.hideMap = true;
  this.dispatchToggleMap = false;

  // ImGui
  this.customColor = {x:0.45, y:0.55, z:0.60, w:1.00};
  this.customRecursiveBezierColor = {x:0.77, y:0.67, z:1.00, w:1.00};

  this.mapSrc = document.getElementById("mapId");
  this.canvas = document.getElementById("canvas");
  this.drawing = document.getElementById("drawing");
  
  this.io = new IO(this)
  this.events = new Events(this)
  // this.point = new Point(this)
  this.circle = new Circle(this)
  this.line = new Line(this)
  this.arc = new Arc(this)
  this.dragpoints = new BezierPoint(this)
  this.clock = new Clock(this)
  // this.gui = new GUI(this)
  this.drawer = new Drawer(this)
  this.frames = new Frame(this)

  this.dragpoints.init()
  this.dragPointCount = this.dragpoints.bezierPoints.length 
  this.proportionalDistance = new Array(1).fill(0.0);

  if (this.canvas && this.canvas.getContext) {
    this.context = this.canvas.getContext("2d");
    // window.addEventListener("resize", windowResizeHandler, false);
    // windowResizeHandler();
  }

  this.init = () => {
    // this.events.init()
    // this.gui.init()
  }

  this.start = () => {
    console.info('Client', 'Starting..')
    this.io.start()
    this.events.start()
    this.clock.start()
    this.reset()
    this.update()
  }

  this.reset = () => {
    this.frames.reset()
    this.clock.play()
  }
  
  this.clear = () => {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  this.run = () => {
    this.io.clear()
    this.clock.run()
    this.frames.run()
    this.io.run()
    this.update()
  }

  this.update = () => {
    this.clear()
    this.drawProgram()
  }

  this.drawProgram = () => {
    this.frames.update()
    // this.gui.update()
  }
}





