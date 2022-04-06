 frameRate(40);
 var MODE_AUTO = 0;
 var MODE_MANUAL = 1;
 var t = 0.00;
 var mode = MODE_AUTO;
 var duration = 300;
 var slideShow = true;
 var slideTime = 12000; // ms
 var startTime = millis();
 var pointSet = 2;
 var factorial = function(n) {
     if (n === 0) {
         return 1;
     } else {
         return n * factorial(n-1);
     }
 };
 var combinations = function(n, i) {
     return factorial(n) / factorial(i) / factorial(n-i);
 };
 var deltaTime = function() {
     return millis() - startTime;
 };
 var Point = function(args) {
     this.p = args.p;
     this.size = args.size || 15;
     this.clr = args.clr || color(255, 0, 0);
     this.hoverClr = args.hoverClr || color(0, 250, 30);
     this.selectClr = args.selectClr || color(0, 0, 0);
     this.draggable = args.draggable || false;
     this.selected = false;
 };
 Point.prototype.draw = function() {
     fill(this.clr);
     if (this.draggable) {
         if (this.selected) {
             fill(this.selectClr);
             textSize(15);
             text('('+this.p.x+', '+this.p.y+')', 
                 this.p.x + 10, this.p.y);
         } else if (this.mouseIsOver()) {
             fill(this.hoverClr);
         }
     }
     noStroke();
     ellipse(this.p.x, this.p.y, this.size, this.size);
 };
 Point.prototype.mouseIsOver = function() {
     return this.draggable && dist(this.p.x, this.p.y, mouseX, mouseY) <= this.size/2;
 };
 var pointSets = [
     [   [60, 100], [190, 42], [308, 28], [413, 24], [498, 45], [548, 120],
         [588, 230], [590, 350], [590, 430], [553, 490], [488, 525], [425, 536],
         [308, 544], [177, 539], [74, 498], [34, 437], [15, 316], [18, 220],
     [48, 110],
     ],
     [   [60, 100], [350,  10],[ 580,  30], [580, 400], [300, 580],
     [15, 515], [55, 105], [570, 25], [570, 585], [10, 585], [50, 105],
   ],
   [	[60, 100], [350,  10],[ 580,  30], [580, 400], [300, 580],
     [15, 515], [55, 105], 
   ],
 // 	[	[50, 50], [59, 150], [100, 300], 
 // 		[200, 400], [300, 300], [400, 200], 
 // 		[500, 300], [540, 450], [560, 550], 
 // 	],
   [	[50, 100], [150, 109], [300, 150], 
     [400, 250], [300, 350], [200, 450], 
     [300, 550], [450, 590], [560, 600], 
   ],
   [	[50, 100], [550, 100], [550, 550], 
   ],
 ];
 var points = [];
 var buildPoints = function() {
     points = [];
     for (var i = 0; i < pointSets[pointSet].length; i++) {
         points.push(new Point( {
             p: new PVector( pointSets[pointSet][i][0], 
             pointSets[pointSet][i][1] ), draggable: true }) );
     }
 };
 var drawPoints = function() {
     for (var i = 0; i < points.length; i++) {
         points[i].draw();
     }
 };
 /**
  * it is truly sad that PVector.set, add, mult, etc. do not "return" "this" so that
  * these functions can be used in functional chains like
  * P.Add(Ai.set(points[i].p).(mult(combinations(n,i) * pow(1-t,n-i) * pow(t, i)));
  * We thus have to have a statement per operation.  Oh well.
  * 
  * Also the grabage collection in this JS implementation is either garbage or non-existant
  * In places where new is used in the "draw" loop, I pulled those instances out and I am
  * using set on a global instance to avoid high frequency object creation and destruction.
  * Without these measures the program would simply bog down and Oh noes would say the program 
  * is taking too long blah blah.
  */
 var Ai = new PVector();
 var computePoint = function(points, t, P) {
     var n = points.length-1;
     P.set(0,0);
     for (var i = 0; i  <= n;i++) {
         Ai.set(points[i].p);
         Ai.mult(combinations(n,i) * pow(1-t,n-i) * pow(t, i));
         P.add(Ai);
     }
 };
 /**
  * Technically one could just draw the n-1 lines connecting the n points but by 
  * having a Line object one can provide a nicer line draw function to show the movement 
  * of t from one end of the line to the other with custom "time" color transitions, etc.
  */
 var Line = function(args) {
     this.p1 = args.p1;
     this.p2 = args.p2;
     this.points = [this.p1, this.p2];
     this.clickable = args.clickable || false;
     this.p = new PVector(this.p1.x,this.p1.y);
     this.clr = args.clr || color(0, 0, 0);
     this.tclr = args.tclr || color(209, 178, 52);
     this.w = args.w || 2;
 };
 Line.prototype.draw = function() {
     stroke(this.clr);
     strokeWeight(this.w);
     line(this.p1.p.x, this.p1.p.y, this.p2.p.x, this.p2.p.y);
     stroke(this.tclr);
     strokeWeight(this.w+3);
     computePoint(this.points, t, this.p);
     line(this.p1.p.x, this.p1.p.y, this.p.x, this.p.y);
     ellipse(this.p.x, this.p.y, 5, 5 );
 };
 /**
  * Here we define the lines between the points and provide for a transition of colors for 
  * the t fraction that is being traced out.  We define the lines in two passes.  The first 
  * set of lines is driven by the points.  The second set of lines is driven by the "t" driven 
  * points between each line of the prior "generation"  This means that the 0th set of lines 
  * is driven by the points array while the ith set of lines is driven by the (i-1)th sub-array 
  * of lines.  we set up the lines array in a function that can be called if/when the lines 
  * array is adjusted to deal with new/deleted points
  */
 var tColor1 = color(32, 142, 201);
 var tColor2 = color(95, 219, 13);
 var tLine = new Line( {   
         p1: new Point({p: new PVector( 30, 10),}), 
         p2: new Point({p: new PVector( 30+150, 10),}), tclr: tColor1
 } );
 var lines;
 var resetLines = function() {
     // nuke the array and reset completely - it's simpler that way!
     lines = [];
     // this is for the lines betwen the control points
     lines.push([]);
     for (var i = 0; i< points.length-1;i++) {
         lines[0].push(new Line({p1: points[i], p2: points[i+1], clickable: true, tclr: tColor1}));
     }
     // the next generations are based on the prior generation's t points.  There are
     // points.length-1 generations including the one above 
     for (var i = 1; i < points.length-1;i++) {
         lines.push([]); 
         for (var j = 0; j < lines[i-1].length-1;j++) {
             lines[i].push( 
                 new Line( { p1: new Point({p: lines[i-1][j].p }), 
                             p2: new Point({p: lines[i-1][j+1].p }), 
                             tclr: lerpColor(tColor1, tColor2, i/(points.length-2))
                 } ) );
         }
     }
         
 };
 var drawLines = function(lines) {
     for (var i = 0; i < lines.length; i++) {
         for (var j = 0; j < lines[i].length; j++) {
             lines[i][j].draw();
         }
     }
 };
 /**
  * More global variables to avoid too many new(s) for the JS GC.
  * 
  * The drawCurve gets a callback.  Originally I drew points but the dotted
  * effect seemed less good over time and thus the connected line segments
  * via drawCurveSegment was done to create a smoother effect.
  */
 var P = new PVector();
 var Q = new PVector();
 var iterations = 50;
 var drawCurve = function( drawShape ) {
     computePoint(points, 0, P);
     for (var i = 1; i <= iterations; i++) {
         computePoint(points, map(i, 0, iterations, 0, 1), Q);
         drawShape(P, Q);
         P.set(Q);
     }
 };
 var drawCurveSegment = function(p1, p2) {
     stroke(tColor2);
     strokeWeight(1.0);
     line(p1.x, p1.y, p2.x, p2.y);
 };
 var drawHopper = function(p1) {
     fill(179, 89, 29);
     stroke(179, 89, 29);
     strokeWeight(1.0);
     ellipse(p1.x, p1.y, 10, 10);
     image(getImage("creatures/Hopper-Cool"),p1.x, p1.y, 50, 50);
     if (t > 0.42 && t < 0.79 && pointSet===1) {
         pushMatrix();
         translate(p1.x+30, p1.y);
         fill(237, 184, 92);
         noStroke();
         triangle(0, 0, 10, -30, 20, -30);
         ellipse(10, -45, 100, 50);
         fill(0, 0, 0);
         text('weeeee!', -30, -40);
         popMatrix();
     }
 };
 var drawInfo = function() {
     fill(0, 0, 0);
     textSize(20);
     text('Select the control points and drag to new positions to change the curve. \n\n' +
         'Right click a control point to remove it.\n\n' +
         'Click elsewhere to add new Control points\n\n' + 
         'Click on timeline and drag to control drawing\n\n' +
         'Click on "curve" to cycle through some predefined sets of control points\n\n' +
         'Click on Slide Show to toggle stay/play',145, 103, 341, 500);
     tLine.draw();
     text('t= '+round(100*t)/100, tLine.p2.p.x+10, 20);
     text('points = ' + points.length, 25, 60);
     var next = constrain(map(deltaTime(), 0, slideTime, 0, 1), 0, 1);
     var z = (mouseY > 0 && mouseY < 25 && mouseX > 430 && mouseX < 580) ? 
         fill(tColor2) : slideShow ? fill(lerpColor(tColor1, color(255,0,0), next)) : 
         fill(0, 0, 0);
     text('Slide Show: ' + (slideShow ? next >= 1 ? 'On*' : 'On' : 'Off'), 430, 20) ;
     z = (mouseY > 25 && mouseY < 45 && mouseX > 25 && mouseX < 110) ? 
         fill(tColor2) : fill(0,0,0);
 
     text('curve = ' + pointSet, 25, 40);
 };
 /**
  * The various I/O techniques are coded here to handle mouse clicks and drags.
  * 
  * Left click on control poinit selects and then dragging can be done
  * Right Click on control point deletes it.
  * Left click elsewhere on canvas creates new control point
  * 
  * In order to move the control point single pixels the keyboard can be used
  * Select a control point via the mouse and hold down the mouse while 
  * using the arrow keys to move the control point.
  */
 var mousePressed = function() {
     // select the time line and manually control the value of t
     if (mouseY < tLine.p1.p.y+5 && mouseX <= tLine.p2.p.x) {
         mode = MODE_MANUAL;
     } else if (mouseY < 45 && mouseX > 20 && mouseX < 100) {
         pointSet = (pointSet+1) % pointSets.length;
         buildPoints();
         resetLines();
     } else if  (mouseY > 0 && mouseY < 25 && mouseX > 430 && mouseX < 580) {
         slideShow = !slideShow;
     } else { // otherwise manage control points
         for (var i = 0;i < points.length;i++) {
             if (points[i].mouseIsOver()) {
                 points[i].selected = true;
                 if (mouseButton === RIGHT) {
                     points.splice(i,1);
                 }
                 resetLines();
                 return;
             }
         }
         points.push(new Point({p: new PVector(mouseX, mouseY), draggable:true}));
         resetLines();
     }
 };
 var mouseReleased = function() {
     for (var i = 0;i < points.length;i++) {
         points[i].selected = false;
     }
     mode = MODE_AUTO;
 };
 var mouseDragged = function() {
     for (var i = 0;i < points.length;i++) {
         if (points[i].selected) {
             points[i].p.x = mouseX;
             points[i].p.y = mouseY;
             break;
         }
     }
 };
 var keys = [];
 /**
  * This routine provides a smoother motion when called from draw, but it tends to
  * prevent fine tuned movement as it can execute multiple times per key click.
  * Thus we call it from the keyPressed function as it is called per the key 
  * press/auto-repeat of the keyboard driver and allows single pixel fine 
  * grained adjustment.
  */
 var setKALoopTimer = function(val) {
     this[["KAInfiniteLoopSetTimeout"][0]](val);
 };
 var checkKeys = function() {
     var dx = keys[LEFT] ? -1 : keys[RIGHT] ? 1 : 0;
     var dy = keys[UP] ? -1 : keys[DOWN] ? 1 : 0;
     for (var i = 0;i < points.length;i++) {
         if (points[i].selected) {
             points[i].p.x += dx;
             points[i].p.y += dy;
             break;
         }
     }
     if (keys[67]) {
         pointSet = (pointSet+1) % pointSets.length;
         buildPoints();
         resetLines();
         keys[67] = false;
         startTime = millis();
     }
     if (keys[83]) {
         slideShow = !slideShow;
     }
 };
 var myKeyPressed = function(myKey) {
     keys[myKey] = true;
     checkKeys();
     
 };
 var keyPressed = function() {
     myKeyPressed(keyCode);
 };
 var keyReleased = function() {
     keys[keyCode] = false;
 };
 
 buildPoints();
 resetLines();
 draw = function() {
     t = mode === MODE_AUTO ? 
         map(frameCount % duration, 0, duration-1, 0, 1) :
         constrain(
             map(mouseX, tLine.p1.p.x, tLine.p2.p.x, 0, 1), 0, 1);
     if (deltaTime() > slideTime && t===0 && slideShow) {
         myKeyPressed(67);
     }
 
     background(255, 255, 255);
     drawCurve(drawCurveSegment);
     
     drawLines(lines);
     drawPoints();
     drawInfo();
     computePoint(points, t, P);
     drawHopper(P);
     setKALoopTimer(1000000);
 };