/* global IO */
/* global Events */
/* global Circle */
/* global Line */
/* global Arc */
/* global BezierPoint */
/* global Clock */
/* global GUI */
/* global Drawer */
/* global Frame */
/* global world */
/* global Docs */

function Client() {
  this.stepSize = 1;
  this.proportionalDistance = [];
  this.distanceSpeed = 0.01;
  this.pause = false;

  this.dragpoints = {};

  this.showSandboxWindow = false
  this.addNewPointGroup = false;

  this.position = null;
  this.mouseDrag = false;

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

  this.midiActived = false;
  this.oscActived = false;

  this.oscMsgLine = "" 
  this.oscMsgPoint = ""

  // ImGui
  this.customColor = {x:0.45, y:0.55, z:0.60, w:1.00};
  this.customRecursiveBezierColor = {x:0.77, y:0.67, z:1.00, w:1.00};

  this.mapSrc = document.getElementById("mapId");
  this.canvas = document.getElementById("canvas");
  this.drawing = document.getElementById("drawing");

  this.io = new IO(this)
  this.events = new Events(this)
  this.circle = new Circle(this)
  this.line = new Line(this)
  this.arc = new Arc(this)
  this.dragpoints = new BezierPoint(this)
  this.clock = new Clock(this)
  this.docs = new Docs(this)
  this.gui = new GUI()
  this.drawer = new Drawer(this)
  this.frames = new Frame(this)

  this.dragpoints.init()
  this.dragPointCount = this.dragpoints.bezierPoints.length 
  this.proportionalDistance = new Array(1).fill(0.0);

  this.windowResizeHandler = function(){
    world.width = window.innerWidth;
    world.height = window.innerHeight;
  
    this.drawing.style.width = world.width + "px";
    this.drawing.style.height = world.height + "px";
  
    this.canvas.width = world.width;
    this.canvas.height = world.height;
  }

  if (this.canvas && this.canvas.getContext) {
    this.context = this.canvas.getContext("2d");
    window.addEventListener("resize", this.windowResizeHandler, false)
    this.windowResizeHandler()
  }

  this.init = () => {
    this.docs.set('Control', 'Play/Pause', 'Spacebar', () => {  })
    this.docs.set('Control', 'Switch group', 'Tab', () => {  })
    this.docs.set('Control', 'Toggle Control-line', 'c', () => {  })
    this.docs.set('Control', 'Toggle All Control-line', 'C', () => {  })
    this.docs.set('Control', 'Toggle L-Point', 'l', () => {  })
    this.docs.set('Control', 'Toggle All L-Points', 'L', () => {  })
    this.docs.set('Control', 'Toggle R-Points', 'r', () => {  })
    this.docs.set('Control', 'Toggle All R-Points', 'R', () => {  })

    this.docs.set('Edit', 'Add New Point', 'CmdOrCtrl+LeftClick', () => {  })
    this.docs.set('Edit', 'Add Point Group', 'Shift+n', () => { })
    this.docs.set('Edit', 'Remove Point', 'RightClick', () => { })

    this.gui.init()
  }

  this.start = () => {
    console.info('Client', 'Starting..')
    console.info(`${this.docs.toString()}`)
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
    this.gui.update()
  }
}





