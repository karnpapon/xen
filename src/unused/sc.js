/*
 * Get "pointers" to common math functions to speed up the calls. This avoids
 * having to resove the Math object member before calling the function ans is
 * suppsoed to be faster.
 */
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

var BLUE = makeRGB( 170, 200, 255 );
var GREEN = makeRGB( 120, 255, 120 );
var RED = makeRGB( 255, 180, 180 );
var BOLDRED = makeRGB( 255, 64, 64 );
var YELLOW = makeRGB( 232, 215, 100 );
var WHITE = makeRGB( 255, 255, 255 );

var POINTRADIUS = 4;
var BLACK = makeRGB( 0.0, 0.0, 0.0 );
var GRAY = makeRGB( 150, 150, 150 );
var LIGHTGRAY = makeRGB( 220, 220, 220 );

var ShowConstructionDescriptions = false;
var ConstructionIndex = 0;
var MaxConstructionDescriptions = 0;

var RotationAngle = 0;
var ProportionalDistance = 0.0;
var ConstantAnimation = false;
var Pause = false

var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
if( CP.lineTo )
{
    CP.dashedLine = function(x, y, x2, y2, da) {
        if (!da) da = [10,5];
        this.save();
        var dx = (x2-x), dy = (y2-y);
        var len = Math.sqrt(dx*dx + dy*dy);
        var rot = Math.atan2(dy, dx);
        this.translate(x, y);
        this.moveTo(0, 0);
        this.rotate(rot);       
        var dc = da.length;
        var di = 0, draw = true;
        x = 0;
        while (len > x) {
            x += da[di++ % dc];
            if (x > len) x = len;
            draw ? this.lineTo(x, 0): this.moveTo(x, 0);
            draw = !draw;
        }       
        this.restore();
    }
}

var DemoSelection = "";

/*
 * Generate random integers in the range. This ensures that each possible
 * result has the same likelyhood of being returned by adding the .9999999
 * to the floating point multiplier before we take the floor of the random
 * result.
 */
function randomInt( minimum, maximum )
{
	if( minimum == undefined || maximum == undefined )
		return 0;
	var temp = maximum - minimum;
	temp += 0.9999999;
	return minimum + floor( random() * temp );
}

function relativeCoordinates( X, Y )
{
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = canvas;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = X - totalOffsetX;
    canvasY = Y - totalOffsetY;

    return {x:canvasX, y:canvasY}
}

function relMouseCoords( event )
{
	if( event.offsetX !== undefined && event.offsetY !== undefined )
	{
		return {x:event.offsetX, y:event.offsetY}; 
	}
	
	return relativeCoordinates( event.pageX, event.pageY );
}

HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

document.onselectstart = function(){ return false; }

var dragpoints = new Array( 
	// Line to Point
	new Point( 0, 180, BLACK ), //0
	new Point( 0, 0, BLACK ),
	new Point( 110, -100, BLACK ),

	// Cam Lobe
	new Point( 0, 100, BLACK ), //3
	new Point( 50, 50, BLACK ),
	new Point( 0, -100, BLACK ),
	new Point( -250, 50, BLACK ),
	
	// Line to Circle
	new Point( -260, 0, BLACK ), // 7
	new Point( -100, 0, BLACK ),
	new Point( 100, 0, BLACK ),
	new Point( 165, -65, BLACK ),

	// Line to Line
	new Point( -130, -130, BLACK ), //11
	new Point( 0, -50, BLACK ),
	new Point( 60, -150, BLACK ),
	new Point( 60, 150, BLACK ),

	// Bezier Cam
	new Point( -300, 130, BLACK ), // 15
	new Point( -210, 130, BLUE ),
	new Point( -200, 90, BLUE ),
	new Point( -150, 90, BLACK ),
	new Point( -100, 90, BLUE ),
	new Point( -50, 90, BLUE ),
	new Point( 0, 90, BLACK ),
	new Point( 50, 90, BLUE ),
	new Point( 80, 130, BLUE ),
	new Point( 150, 110, BLACK ),
	new Point( 220, 90, BLUE ),
	new Point( 250, 130, BLUE ),
	new Point( 300, 130, BLACK ),
	new Point( 0, -165, BLACK ), // 28 (still part of Bezier page)
	
	// Chord Radius
	new Point( 0, -50, BLACK ), // 29
	new Point( 40, 0, BLACK ),
	new Point( 0, 50, BLACK ),

	// Circle Intersect
	new Point( -100, 0, BLACK ), // 32
	new Point( -220, -100, BLACK ),
	new Point( 100, 0, BLACK ),
	new Point( 165, -65, BLACK ),
	
	// Two Circle Tangent
	new Point( -100, 0, BLACK ), // 36
	new Point( -220, -100, BLACK ),
	new Point( 100, 0, BLACK ),
	new Point( 165, -65, BLACK ),
	
	// Two Circle Curved Tangent
	new Point( -100, 0, BLACK ), // 40
	new Point( -220, -100, BLACK ),
	new Point( 100, 0, BLACK ),
	new Point( 165, -65, BLACK ),
	
	// Running Cam 
	// No drag points for the "runningcam" Scenario.
						   
	// Slow Bezier Drawing Senario
	new Point( -100, 0, BLACK ), // 44
	new Point( -220, -100, BLACK ),
	new Point( 400, -65, BLACK ),
	new Point( 50, 0, BLACK ),
	new Point( 200, 0, BLACK ),
	new Point( 300, 0, BLACK ),
	
	// Arc on Lines
	new Point( -40, 180, BLACK ), //0
	new Point( 0, 0, BLACK ),
	new Point( 110, 180, BLACK ),
	new Point( 80, 30, BLACK )


);

var DragPointStart = 0;
var DragPointCount = 2;
var DragPoint = -1;
var xDrag = 0;
var yDrag = 0;
var xOld = 0;
var yOld = 0;
var xOffset = 0;
var yOffset = 0;

var canvas;
var legend;
var drawing;
var context;

var DoCreate = false;
var lastTime = new Date().getTime();
var timeScale = 1;

var enableHandler = true;

world = { width: 0, height: 0 };

function init()
{
	canvas = document.getElementById( 'canvas' );
	legend = document.getElementById( 'legend' );
	drawing = document.getElementById( 'drawing' );
	
	canvas.onclick = MouseClick;
	canvas.onmousedown = ButtonDown;
	canvas.onmouseup = ButtonUp;
	canvas.onmousemove = MouseMove;

  canvas.addEventListener( "touchstart", touchHandler, false );
  canvas.addEventListener( "touchmove", touchHandler, false );
  canvas.addEventListener( "touchend", touchHandler, false );

  timer = window.setInterval(function(){
		enableHandler = true;
	}, 10 );		
	
	if( canvas && canvas.getContext ) 
	{
		context = canvas.getContext( '2d' );
		
		window.addEventListener( 'resize', windowResizeHandler, false );
		windowResizeHandler();
	}
	
	animBezier( getRadioCheckedValue( 'selectdemo' ) );
	
	AnimationLoop();
};

function AnimationLoop()
{
	if( ConstantAnimation )
		animate();
	requestAnimFrame( AnimationLoop );
}

// shim with setTimeout fallback from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();


function getRadioCheckedValue( radio_name )
{
   var oRadio = document.forms[0].elements[radio_name];
 
   for(var i = 0; i < oRadio.length; i++)
   {
      if(oRadio[i].checked)
      {
         return oRadio[i].value;
      }
   }
 
   return "";
}

function MouseMove( event )
{
	if( !MouseDrag )
		return;
	Position = canvas.relMouseCoords( event );
	DragMove( event );
}

function DragMove( event )
{
	if( DragPoint >= 0 )
	{
		var xc = world.width / 2;
		var yc = world.height / 2;

		var p = new Point( Position.x - xc, Position.y - yc, dragpoints[DragPoint].color );
		
		xOffset = p.x - xOld;
		yOffset = p.y - yOld;
		xOld = p.x;
		yOld = p.y;

		xDrag = p.x - dragpoints[DragPoint].x;
		yDrag = p.y - dragpoints[DragPoint].y;
		
		dragpoints[DragPoint].x = p.x;
		dragpoints[DragPoint].y = p.y;
		
		//ProportionalDistance = 0.0

		animate();
	}
}

function touchHandler( event ) 
{
	event.preventDefault();
	if( event.targetTouches.length <= 1 ) // One finger touch (or no fingers for a touchend event).
	{
		if ( event.type == "touchend" || event.type == "touchcancel" ) 
		{
			FingerDrag = false;
			DragEnd();
		}
		else if( event.targetTouches.length == 1 )
		{
			var touch = event.targetTouches[0];
			Position = relativeCoordinates( touch.pageX, touch.pageY );
			
			if (event.type == "touchstart") 
			{
				DragStart( event, true );
				FingerDrag = true;
			} 
			else if (event.type == "touchmove") 
			{
				if( FingerDrag ) 
					DragMove( event );
			}
		}
	}
}

function MouseClick( event )
{
}

function ButtonDown( event )
{
	Position = canvas.relMouseCoords( event );
	MouseDrag = true;
	Pause = true;
	DragStart( event, false );
}

function DragStart( event, Fingers )
{
	if( Position == null )
		return;
			
	var xc = world.width / 2;
	var yc = world.height / 2;
	
	var SearchRadius = POINTRADIUS;
	if( Fingers ) SearchRadius *= 4;

	var p = new Point( Position.x - xc, Position.y - yc);
	xOld = p.x;
	yOld = p.y;
	xOffset = 0;
	yOffset = 0;
	for( var Index = DragPointStart; Index < DragPointStart + DragPointCount; ++Index )
	{
		// The first time through, look only for black points. This
		// is based on the assumption that black points are control
		// points and that they need to be checked first!
		if( dragpoints[Index].color == BLACK )
			continue;
		if( utils.distance( dragpoints[Index], p ) < SearchRadius + 3 )
		{
			DragPoint = Index;
			xOffset = p.x - dragpoints[DragPoint].x;
			yOffset = p.y - dragpoints[DragPoint].y;
			animate();
			return;
		}
	}
	for( var Index = DragPointStart; Index < DragPointStart + DragPointCount; ++Index )
	{
		if( utils.distance( dragpoints[Index], p ) < SearchRadius + 3 )
		{
			DragPoint = Index;
			xOffset = p.x - dragpoints[DragPoint].x;
			yOffset = p.y - dragpoints[DragPoint].y;
			animate();
			return;
		}
	}
	DragPoint = -1;
}

function ButtonUp( event )
{
	Pause = false
	if( !MouseDrag )
		return;
		
	DragEnd( event );
}

function DragEnd( event )
{
	DragPoint = -1;
}

function getParam(name) 
{
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec( window.location.href );
	if (results == null)
		return "";
	else
		return results[1];
}

function windowResizeHandler() 
{
	legend.style.height = window.innerHeight - 12 + "px";
	
	world.width = window.innerWidth - 258;
	world.height =  window.innerHeight - 40;

	drawing.style.width = ( world.width ) + "px";
	drawing.style.height = world.height + "px";

	canvas.width = world.width;
	canvas.height = world.height;
		
	animate();
}

function msleep(milliseconds) 
{
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) 
	{
		if ((new Date().getTime() - start) > milliseconds)
		{
			break;
		}
	}
}

function getRingPositions( thing, ring )
{
	var startPosition = 0;
	var endPosition = 0;
	if( thing.growStyle & ( GROWSTYLE_GROWIN2 | GROWSTYLE_GROWOUT2 ) )
	{
		var lastRing = thing.rings[thing.rings.length-1];
		var temp = lastRing.position + lastRing.size - 1;
		startPosition = ring.position - temp + ( temp * thing.scale );
		endPosition = ring.position + ring.size - 1 - temp + ( temp * thing.scale );
		if( startPosition < 0 )
			startPosition = 0;
		if( endPosition < 0 )
			endPosition = 0;
	}
	else
	{
		startPosition = ring.position * thing.scale;
		endPosition = ( ring.position + ring.size - 1 ) * thing.scale;
	}
	ring.scaledRingEdge = endPosition;
	
	return { start: startPosition, end: endPosition };
}

function Perpendicular( line, direction )
{
	var perp = new Line( line.x2, line.y2, line.x1, line.y1 );
	if( direction == 1 )
	{
		var dx = line.x2 - line.x1;
		var dy = line.y2 - line.y1;
		perp.x2 = line.x2 - dy;
		perp.y2 = line.y2 + dx;
	}
	else
	{
		var dx = line.x2 - line.x1;
		var dy = line.y2 - line.y1;
		perp.x2 = line.x2 + dy;
		perp.y2 = line.y2 - dx;
	}
	return perp;
}

Line.prototype.Draw = function( color, width )
{
	var xc = world.width / 2;
	var yc = world.height / 2;
	context.strokeStyle = color;
	if( width == undefined || width == null )
	{
		width = 0.8;
		if( color == BLACK )
			width = 1.5;
	}
	context.lineWidth = width;
	context.beginPath();
	context.moveTo( xc + this.x1, yc + this.y1 );
	context.lineTo( xc + this.x2, yc + this.y2 );
	context.stroke();
}

function DrawText( text, x, y, color )
{
	var xc = world.width / 2;
	var yc = world.height / 2;

	context.font = "normal 11pt Arial";

	context.fillStyle = WHITE;
	context.strokeStyle = WHITE;
	context.lineWidth = 3;
	context.lineJoin = "round"
	context.strokeText( text, xc + x, yc  + y );

	context.lineWidth = 1;
	context.fillStyle = color;
	context.strokeStyle = color;
	context.fillText( text, xc + x, yc  + y );
}

function DrawSquare( point, radius, color )
{
	var xc = world.width / 2;
	var yc = world.height / 2;
	context.strokeStyle = color;
	context.lineWidth = 0.8;
	if( color == BLACK )
		context.lineWidth = 1.5;
	context.beginPath();
	context.moveTo( xc + point.x - radius, yc + point.y - radius );
	context.lineTo( xc + point.x + radius, yc + point.y - radius );
	context.lineTo( xc + point.x + radius, yc + point.y + radius );
	context.lineTo( xc + point.x - radius, yc + point.y + radius );
	context.lineTo( xc + point.x - radius, yc + point.y - radius );
	context.stroke();
}

function Intersects( line1, line2, IntersectionPoint )
{
	var q =	(line1.y1 - line2.y1) * (line2.x2 - line2.x1) -
			(line1.x1 - line2.x1) * (line2.y2 - line2.y1);

	var d =	(line1.x2 - line1.x1) * (line2.y2 - line2.y1) - 
			(line1.y2 - line1.y1) * (line2.x2 - line2.x1);

	if( d == 0 )
		return 0;

	var r = q / d;

	var Direction = r >= 0 ? 1 : -1;

	/*
	(Ay-Cy)(Bx-Ax)-(Ax-Cx)(By-Ay)
	s = ----------------------------- (eqn 2)
	(Bx-Ax)(Dy-Cy)-(By-Ay)(Dx-Cx)
	*/

	//q = (line1.y1 - line2.y1) * (line1.x2 - line1.x1) -
	//	(line1.x1 - line2.x1) * (line2.y2 - line1.y1);
	
	//double s = q / d;

	/*
	If r>1, P is located on extension of AB
	If r<0, P is located on extension of BA
	If s>1, P is located on extension of CD
	If s<0, P is located on extension of DC

	The above basically checks if the intersection is located at an	extrapolated
	point outside of the line segments. To ensure the intersection is
	only within	the line segments then the above must all be false, ie r between 0
	and 1 and s between 0 and 1.
	*/

	//if( pbOnBothSegments != NULL )
	//{
	//	if( r < 0 || r > 1 || s < 0 || s > 1 )
	//		*pbOnBothSegments = false;
	//	else
	//		*pbOnBothSegments = true;
	//}

	/*
	Px=Ax+r(Bx-Ax)
	Py=Ay+r(By-Ay)
	*/

	IntersectionPoint.x = line1.x1 + ( r * (line1.x2 - line1.x1));
	IntersectionPoint.y = line1.y1 + ( r * (line1.y2 - line1.y1));

	return Direction;
}

function intersects( circle1, circle2, Intersection1, Intersection2 )
{
	var p2 = new Point( 0, 0, BLACK );
	var d = 0.0;	// distance between circles
	var a = 0.0;	// distance from circle 1 to p2
	var h = 0.0;	// distance from P2 to circle 2

	d = Math.sqrt( ( ( circle2.x - circle1.x ) * ( circle2.x - circle1.x ) ) + ( ( circle2.y - circle1.y ) * ( circle2.y - circle1.y ) ) );

	a = ( ( circle1.r * circle1.r ) - ( circle2.r * circle2.r ) + ( d * d ) ) / ( d + d );

	// Check for the circles being too far apart.
	if( Math.abs( a ) > Math.abs( circle1.r ) )
		return false;
	
	h = Math.sqrt( ( circle1.r * circle1.r ) - ( a * a ) );

	p2.x = circle1.x + a * ( circle2.x - circle1.x ) / d;
	p2.y = circle1.y + a * (circle2.y - circle1.y ) / d;

	var constructionLine1 = new Line( circle1.x, circle1.y, p2.x, p2.y );
	var constructionLine2 = new Line( p2.x, p2.y, dragpoints[34].x, dragpoints[34].y );
	
	Intersection1.x = p2.x + h * ( circle2.y - circle1.y ) / d;
	Intersection1.y = p2.y - h * ( circle2.x - circle1.x ) / d;

	Intersection2.x = p2.x - h * ( circle2.y - circle1.y ) / d;
	Intersection2.y = p2.y + h * ( circle2.x - circle1.x ) / d;
	
	return true;
}

function GetBezierPoint( point0, point1, point2, point3, position )
{
	var point = new Point( 0, 0 );
	var t = position;
	var mt = 1-t;
	var mt_mt_mt = mt*mt*mt;
	var t_t_t = t*t*t;
	var t_t_mt = t*t*mt;
	var t_mt_mt = t*mt*mt;
	
	point.x = (point0.x * mt_mt_mt) + 3 * point1.x * t_mt_mt + 3 * point2.x * t_t_mt + point3.x*t_t_t;	
	point.y = (point0.y * mt_mt_mt) + 3 * point1.y * t_mt_mt + 3 * point2.y * t_t_mt + point3.y*t_t_t;

	return point;
}

function DrawBezier( point0, point1, point2, point3, color )
{
	var distance = utils.distance( point0, point1 ) + utils.distance( point1, point2 ) + utils.distance( point2, point3 );
	
	var Steps = distance / 15.0; // this division seems to make the curves always look good enough.
	
	var xc = world.width / 2.0;
	var yc = world.height / 2.0;
	context.strokeStyle = color;
	context.lineWidth = 1.5;
	
	context.beginPath();
	context.moveTo( xc + point0.x, yc + point0.y );
	
	var Gap = 1.0 / Steps;
	for( var Step = Gap; Step < 1.0; Step += Gap )
	{
		var point = GetBezierPoint( point0, point1, point2, point3, Step );
		context.lineTo( xc + point.x, yc + point.y );
	}
	context.lineTo( xc + point3.x, yc + point3.y );
	context.stroke();
}

function DrawPartialBezier( point0, point1, point2, point3, color, amount )
{
	var distance = utils.distance( point0, point1 ) + utils.distance( point1, point2 ) + utils.distance( point2, point3 );

	var Steps = distance / 5.0; // this division seems to make the curves always look good enough. Smaller divisors make for smaller steps and more of them!
						  
	// Draw all of the construction lines before the curve is drawn.
	var point = new Point( 0, 0 );
	var t = amount;
	var mt = 1-t;
	var mt_mt_mt = mt*mt*mt;
	var t_t_t = t*t*t;
	var t_t_mt = t*t*mt;
	var t_mt_mt = t*mt*mt;

	point.x = (point0.x * mt_mt_mt) + 3 * point1.x * t_mt_mt + 3 * point2.x * t_t_mt + point3.x*t_t_t;
	point.y = (point0.y * mt_mt_mt) + 3 * point1.y * t_mt_mt + 3 * point2.y * t_t_mt + point3.y*t_t_t;

	var pointa = new Point( 0, 0 )
	pointa.x = point0.x + ( ( point1.x - point0.x ) * t )
	pointa.y = point0.y + ( ( point1.y - point0.y ) * t )

	var pointb = new Point( 0, 0 )
	pointb.x = point2.x + ( ( point3.x - point2.x ) * t )
	pointb.y = point2.y + ( ( point3.y - point2.y ) * t )

	var pointc = new Point( 0, 0 )
	pointc.x = point1.x + ( ( point2.x - point1.x ) * t )
	pointc.y = point1.y + ( ( point2.y - point1.y ) * t )

	var pointn = new Point( 0, 0 )
	pointn.x = pointa.x + ( ( pointc.x - pointa.x ) * t )
	pointn.y = pointa.y + ( ( pointc.y - pointa.y ) * t )

	var pointm = new Point( 0, 0 )
	pointm.x = pointc.x + ( ( pointb.x - pointc.x ) * t )
	pointm.y = pointc.y + ( ( pointb.y - pointc.y ) * t )

	var constructionLine = new Line( point1.x,  point1.y, point2.x, point2.y );
	constructionLine.Draw( BLUE );
	var constructionLinea = new Line( pointa.x,  pointa.y, pointc.x, pointc.y );
	constructionLinea.Draw( YELLOW );
	var constructionLineb = new Line( pointb.x,  pointb.y, pointc.x, pointc.y );
	constructionLineb.Draw( YELLOW );
	var constructionLinen = new Line( pointn.x,  pointn.y, pointm.x, pointm.y );
	constructionLinen.Draw( RED );


	FillCircle( pointa, POINTRADIUS, YELLOW );
	FillCircle( pointb, POINTRADIUS, YELLOW );
	FillCircle( pointc, POINTRADIUS, YELLOW );
	FillCircle( pointn, POINTRADIUS, RED );
	FillCircle( pointm, POINTRADIUS, RED );
	FillCircle( point, POINTRADIUS, BOLDRED );

	// Draw the curve.
	var xc = world.width / 2.0;
	var yc = world.height / 2.0;
	context.strokeStyle = color;
	context.lineWidth = 1.5;

	context.beginPath();
	context.moveTo( xc + point0.x, yc + point0.y );

	var Gap = 1.0 / Steps;
	for( var Step = Gap; Step <= amount; Step += Gap )
	{
		var point = GetBezierPoint( point0, point1, point2, point3, Step );
						  
		context.lineTo( xc + point.x, yc + point.y );
	}
	//if( amount == 1.0 )
	//{
	//	context.lineTo( xc + point3.x, yc + point3.y );
	//}
	context.stroke();
						  

}

function PolarToCartesian( angle, radius )
{
	return new Point( radius * cos( angle ), radius * sin( angle ) );
}

function CartesianToPolar( center, point )
{
	var Angle = atan2( point.y - center.y, point.x - center.x );
	//Angle += PI;
	var distance = utils.distance( center, point );
	
	return { a: Angle, r: distance };
}


function DrawPolarBezier( point0, point1, point2, point3, color, firstpointcolor )
{
	var distance = utils.distance( point0, point1 ) + utils.distance( point1, point2 ) + utils.distance( point2, point3 );
	
	var Steps = distance / 10.0; // this division seems to make the curves always look good enough unless the cam is very large.
	
	var xc = world.width / 2.0;
	var yc = world.height / 2.0;
	context.strokeStyle = color;
	context.lineWidth = 1.5;
	
	context.beginPath();
	
	var SavePoint = new Point( 0, 0 );
	
	var Gap = 1.0 / Steps;
	for( var Step = 0; Step < 1 + Gap; Step += Gap )
	{
		var UseStep = min( Step, 1 );
		var point = GetBezierPoint( point0, point1, point2, point3, UseStep );
		
		// Convert this to polar coordinates such that the current x value is 
		// converted to an angle and the current y value is the radius. The
		// Known width of the poly-Bezier-curve is 360 degrees.
		
		// Convert to distsance from left edge, then to value 0 to 1 then to radians.
		var angle = ( point.x + 300 ) / 600 * PI2;
		angle += PI / 2; // Makes the start point of the graph show up at the bottom of the cam.
		
		var CamPoint = PolarToCartesian( angle, 200 - point.y );
		
		CamPoint.x += dragpoints[28].x;
		CamPoint.y += dragpoints[28].y;
		
		if( Step == 0 )
		{
			SavePoint = new Point( CamPoint.x, CamPoint.y );
			context.moveTo( xc + CamPoint.x, yc + CamPoint.y );
		}
		else
			context.lineTo( xc + CamPoint.x, yc + CamPoint.y );
	}
	context.stroke();

	DrawCircle( SavePoint, POINTRADIUS, firstpointcolor, 1 );
}

function DrawEndCurve()
{
	var line = new Line( dragpoints[0].x,  dragpoints[0].y,  dragpoints[1].x,  dragpoints[1].y );

	var constructionLine1 = new Line( dragpoints[1].x,  dragpoints[1].y, dragpoints[2].x,  dragpoints[2].y );
	constructionLine1.Draw( GREEN );
	
	var constructionLine2 = Perpendicular( line, 1 );
	constructionLine2.Draw( BLUE );
	DrawSquare( constructionLine2.Start(), POINTRADIUS, BLUE );
	DrawSquare( constructionLine2.End(), POINTRADIUS, BLUE );

	var constructionLine3 = Perpendicular( constructionLine1, 1 );
	constructionLine3.Move( MidPoint( constructionLine1 ) );
	constructionLine3.Draw( YELLOW );
	DrawSquare( constructionLine3.Start(), POINTRADIUS, GREEN );
	DrawSquare( constructionLine3.End(), POINTRADIUS, YELLOW );
	
	var Intersection = new Point();
	var Direction = Intersects( constructionLine2, constructionLine3, Intersection );
	if( Direction != 0 )
	{
		DrawSquare( Intersection, POINTRADIUS, BOLDRED );
		var Radius = utils.distance( constructionLine1.End(), Intersection );
		DrawCircle( Intersection, Radius, RED, 1 );
		DrawArc( Intersection, Radius, constructionLine1.Start(), dragpoints[2], Direction, BOLDRED, 2 );
	}
	else
		constructionLine1.Draw( BLACK );
	line.Draw( BLACK );
	
	MaxConstructionDescriptions = 6;

	if( ConstructionIndex == 1 )
		DrawDescriptionText( "1. Find the green line from the end of the black line to this point", dragpoints[2].x,  dragpoints[2].y, BLACK, 50 );
	else if( ConstructionIndex == 2 )
		DrawDescriptionText( "2. Find the midpoint of that line at this green square", constructionLine3.Start().x, constructionLine3.Start().y, BLACK, 100 );
	else if( ConstructionIndex == 3 )
		DrawDescriptionText( "3. Find a perpendicular yellow line to the green line", constructionLine3.End().x, constructionLine3.End().y, BLACK, 250 );
	else if( ConstructionIndex == 4 )
		DrawDescriptionText( "4. Find a perpendicular blue line from the end of the black line", constructionLine2.End().x, constructionLine2.End().y, BLACK, 50 );
	else if( ConstructionIndex == 5 )
		DrawDescriptionText( "5. Find the intersection of the blue line and the yellow line", Intersection.x, Intersection.y, BLACK, 50 );
	else if( ConstructionIndex == 6 )
		DrawDescriptionText( "6. The red arc is an arc drawn from here to the other end of the green line with the blue/yellow intersection as the center of the arc", dragpoints[1].x, dragpoints[1].y, BLACK, 50 );
}

function DrawDescriptionText( Text, x, y, Color, Offset )
{
//	x -= ( POINTRADIUS + 2 );
//	y -= ( POINTRADIUS + 2 );
	var xText = -300;
	var yText = -300;

	DrawText( Text, xText, yText, Color );
	
	var line = new Line( xText, yText, x, y );
	line.SetLength( line.Length() - ( POINTRADIUS * 2 ) );
	line.Reverse();
	line.SetLength( line.Length() - ( POINTRADIUS * 2 ) );
	line.Reverse();
	
	line.Draw( LIGHTGRAY );
	
	drawArrow( xText, yText, line.x2, line.y2, GRAY );
}

function drawArrow(fromx, fromy, tox, toy, Color )
{
	context.lineWidth = 1;
	context.fillStyle = Color;
	context.strokeStyle = Color;
	var xc = world.width / 2;
	var yc = world.height / 2;

    headlen = 5;

	var angle = Math.atan2(toy-fromy,tox-fromx);

	//starting a new path from the head of the arrow to one of the sides of the point
	context.beginPath();
	context.moveTo(xc + tox, yc + toy);
	context.lineTo(xc + tox-headlen*Math.cos(angle-Math.PI/7),yc + toy-headlen*Math.sin(angle-Math.PI/7));

	//path from the side point of the arrow, to the other side point
	context.lineTo(xc + tox-headlen*Math.cos(angle+Math.PI/7),yc + toy-headlen*Math.sin(angle+Math.PI/7));

	//path from the side point back to the tip of the arrow, and then again to the opposite side point
	context.lineTo(xc + tox, yc + toy);
	context.lineTo(xc + tox-headlen*Math.cos(angle-Math.PI/7), yc + toy-headlen*Math.sin(angle-Math.PI/7));

	//draws the paths created above
	context.strokeStyle = Color;
	context.stroke();
	context.fillStyle = Color;
	context.fill();
}

function CheckBezierNodePosition()
{
	if( dragpoints[DragPoint].y > 200 )
		dragpoints[DragPoint].y = 200;
		
	var LeftControl = DragPoint - 1;
	var RightControl = DragPoint + 1;
	
	if( DragPoint == 15 )
	{
		dragpoints[15].x = -300;
		dragpoints[27].y = dragpoints[15].y;
		LeftControl = 26;
	}
	else if( DragPoint == 27 )
	{
		dragpoints[27].x = 300;
		dragpoints[15].y = dragpoints[27].y;
		RightControl = 16;
	}

	if( DragPoint > 15 )
	{
		if( dragpoints[DragPoint].x < dragpoints[DragPoint-3].x )
			dragpoints[DragPoint].x = dragpoints[DragPoint-3].x;
	}
	if( DragPoint < 27 )
	{
		if( dragpoints[DragPoint].x > dragpoints[DragPoint+3].x )
			dragpoints[DragPoint].x = dragpoints[DragPoint+3].x;
	}

	dragpoints[LeftControl].x += xOffset;
	dragpoints[LeftControl].y += yOffset;
	dragpoints[RightControl].x += xOffset;
	dragpoints[RightControl].y += yOffset;
}

function CheckBezierControlPosition()
{
	var Temp = DragPoint - 14;
	var Opposite = 0;
	var Node = 0;
	var OppositeNode = 0;
	if( ( Temp % 3 ) == 0 )
	{
		Opposite = DragPoint + 2;
		Node = DragPoint + 1;
		if( dragpoints[DragPoint].x > dragpoints[DragPoint+1].x )
			dragpoints[DragPoint].x = dragpoints[DragPoint+1].x;
	}
	else
	{
		Opposite = DragPoint - 2;
		Node = DragPoint - 1;
		if( dragpoints[DragPoint].x < dragpoints[DragPoint-1].x )
			dragpoints[DragPoint].x = dragpoints[DragPoint-1].x;
	}
	
	OppositeNode = Node;
	
	if( Opposite > 27 )
	{
		Opposite = 16;
		OppositeNode = 15;
	}
	else if( Opposite < 15 )
	{
		Opposite = 26;
		OppositeNode = 27;
	}
		
	var Angle = atan2( dragpoints[DragPoint].y - dragpoints[Node].y, dragpoints[DragPoint].x - dragpoints[Node].x );
	Angle += PI;
	var distance = utils.distance( dragpoints[OppositeNode], dragpoints[Opposite] );
	
	var offset = getOffset( Angle, distance );
	dragpoints[Opposite].x = dragpoints[OppositeNode].x + offset.x;
	dragpoints[Opposite].y = dragpoints[OppositeNode].y + offset.y;
}

function DrawBezierCam()
{
	if( DragPoint >= 15 && DragPoint <= 27 )
	{
		var Temp = DragPoint - 14;
		if( ( Temp % 3 ) == 1 )
			CheckBezierNodePosition();
		else
			CheckBezierControlPosition();
	}

	// Background.
	var BackLine = new Line( -300,  200,  300,  200 );
	BackLine.Draw( RED );
	
	//DrawCircle( new Point( 0, -200 ), POINTRADIUS, RED, 1 );

	// Draw the curves.
	for( var Index = 0; Index < 12; Index += 3 )
	{
		DrawBezier( dragpoints[15+Index], dragpoints[15+Index+1], dragpoints[15+Index+2], dragpoints[15+Index+3], BLACK );
		DrawPolarBezier( dragpoints[15+Index], dragpoints[15+Index+1], dragpoints[15+Index+2], dragpoints[15+Index+3], BLACK, Index == 0 ? BLACK : GRAY );
	}
	
	// Draw control lines for the control points.
	for( var Index = 0; Index < 12; Index += 3 )
	{
		var ControlLine1 = new Line( dragpoints[15+Index].x,  dragpoints[15+Index].y,  dragpoints[15+Index+1].x,  dragpoints[15+Index+1].y );
		var ControlLine2 = new Line( dragpoints[15+Index+2].x,  dragpoints[15+Index+2].y,  dragpoints[15+Index+3].x,  dragpoints[15+Index+3].y );
		ControlLine1.Draw( BLUE );
		ControlLine2.Draw( BLUE );
	}

	return;
}

function DrawCircleIntersect()
{
	if( DragPoint == 32 )
	{
		dragpoints[33].x += xOffset;
		dragpoints[33].y += yOffset;
	}
	else if( DragPoint == 34 )
	{
		dragpoints[35].x += xOffset;
		dragpoints[35].y += yOffset;
	}

	var Radius1 = utils.distance( dragpoints[32], dragpoints[33] );
	DrawCircle( dragpoints[32], Radius1, BLACK, 2 );

	var Radius2 = utils.distance( dragpoints[34], dragpoints[35] );
	DrawCircle( dragpoints[34], Radius2, BLACK, 2 );
	
	var p2 = new Point( 0, 0, BLACK );
	var p3 = new Point( 0, 0, BLACK );
	var p4 = new Point( 0, 0, BLACK );
	var d = 0.0;	// distance between circles
	var a = 0.0;	// distance from circle 1 to p2
	var h = 0.0;	// distance from P2 to circle 2

	d = Math.sqrt( ( ( dragpoints[34].x - dragpoints[32].x ) * ( dragpoints[34].x - dragpoints[32].x ) ) + ( ( dragpoints[34].y - dragpoints[32].y ) * ( dragpoints[34].y - dragpoints[32].y ) ) );

	a = ( ( Radius1 * Radius1 ) - ( Radius2 * Radius2 ) + ( d * d ) ) / ( d + d );

	// Check for the circles being too far apart.
	if( Math.abs( a ) > Math.abs( Radius1 ) )
	{
		var constructionLine = new Line( dragpoints[32].x, dragpoints[32].y, dragpoints[34].x, dragpoints[34].y );
		constructionLine.Draw( RED );
		return;
	}
	
	h = Math.sqrt( ( Radius1 * Radius1 ) - ( a * a ) );

	p2.x = dragpoints[32].x + a * ( dragpoints[34].x - dragpoints[32].x ) / d;
	p2.y = dragpoints[32].y + a * ( dragpoints[34].y - dragpoints[32].y ) / d;

	var constructionLine1 = new Line( dragpoints[32].x, dragpoints[32].y, p2.x, p2.y );
	var constructionLine2 = new Line( p2.x, p2.y, dragpoints[34].x, dragpoints[34].y );
	
	p3.x = p2.x + h * ( dragpoints[34].y - dragpoints[32].y ) / d;
	p3.y = p2.y - h * ( dragpoints[34].x - dragpoints[32].x ) / d;

	p4.x = p2.x - h * ( dragpoints[34].y - dragpoints[32].y ) / d;
	p4.y = p2.y + h * ( dragpoints[34].x - dragpoints[32].x ) / d;
	
	var temp = new Line( p2.x, p2.y, p3.x, p3.y );
	temp.SetLength( 200 );
	var constructionLine3 = new Line( p2.x, p2.y, temp.x2, temp.y2 );
	temp.SetLength( -200 );
	constructionLine3.x1 = temp.x2;
	constructionLine3.y1 = temp.y2;

	constructionLine1.Draw( BLUE );
	constructionLine2.Draw( GREEN );
	constructionLine3.Draw( YELLOW );
	DrawSquare( constructionLine3.Start(), POINTRADIUS, YELLOW );
	DrawSquare( constructionLine3.End(), POINTRADIUS, YELLOW );
	DrawSquare( p2, POINTRADIUS, BOLDRED );
	FillCircle( p3, POINTRADIUS, BOLDRED );
	FillCircle( p4, POINTRADIUS, BOLDRED );


}

function DrawCircleTangent()
{
	if( DragPoint == 36 )
	{
		dragpoints[37].x += xOffset;
		dragpoints[37].y += yOffset;
	}
	else if( DragPoint == 38 )
	{
		dragpoints[39].x += xOffset;
		dragpoints[39].y += yOffset;
	}
	
	var BigCircle = new Circle( dragpoints[36].x, dragpoints[36].y, utils.distance( dragpoints[37], dragpoints[36] ) );
	var SmallCircle = new Circle( dragpoints[38].x, dragpoints[38].y, utils.distance( dragpoints[39], dragpoints[38] ) );
	if( SmallCircle.r > BigCircle.r )
	{
		BigCircle = new Circle( dragpoints[38].x, dragpoints[38].y, utils.distance( dragpoints[39], dragpoints[38] ) );
		SmallCircle = new Circle( dragpoints[36].x, dragpoints[36].y, utils.distance( dragpoints[37], dragpoints[36] ) );
	}

	BigCircle.Draw( BLACK, 2 );
	SmallCircle.Draw( BLACK, 2 );

	var constructionLine = new Line( BigCircle.x, BigCircle.y, SmallCircle.x, SmallCircle.y );
	constructionLine.Draw( BLUE );
	constructionLine.SetLength( constructionLine.Length() / 2 );
	
	DrawSquare( constructionLine.End(), POINTRADIUS, YELLOW );
	var ConstructionCircle = new Circle( constructionLine.End().x, constructionLine.End().y, constructionLine.Length() );
	ConstructionCircle.Draw( RED, 1 );

	var BigCircleInner = new Circle( BigCircle );
	BigCircleInner.r = BigCircle.r - SmallCircle.r;
	BigCircleInner.Draw( BLUE, 1 );
	
	var TempPoint = new Point( 0, 0, BLACK );
	var TempPoint2 = new Point( 0, 0, BLACK );
	
	var p1 = new Point( 0, 0, BLACK );
	var p2 = new Point( 0, 0, BLACK );
	if( intersects( BigCircleInner, ConstructionCircle, p1, p2 ) )
	{		
		var constructionLine2 = new Line( BigCircle.x, BigCircle.y, p1.x, p1.y );
		var Length = constructionLine2.Length();
		constructionLine2.SetLength( BigCircle.r );
		constructionLine2.Draw( GREEN );
		DrawSquare( p1, POINTRADIUS, GREEN );
		DrawSquare( constructionLine2.End(), POINTRADIUS, BOLDRED );
		TempPoint2 = constructionLine2.End();

		var constructionLine3 = new Line( p1.x, p1.y, SmallCircle.x, SmallCircle.y );
		constructionLine3.Draw( RED );
		TempPoint = MidPoint( constructionLine3 );
		
		constructionLine3.Move( constructionLine2.End() );
		constructionLine3.Draw( BOLDRED, 2 );
		DrawSquare( constructionLine3.End(), POINTRADIUS, BOLDRED );
	}
	
	MaxConstructionDescriptions = 5;
	
	if( ConstructionIndex == 1 )
		DrawDescriptionText( "1. Find the midpoint between the two circles", ConstructionCircle.x,  ConstructionCircle.y, BLACK, 30 );
	else if( ConstructionIndex == 2 )
	{
		var Temp = new Line( ConstructionCircle.x,  ConstructionCircle.y, ConstructionCircle.x - 500,  ConstructionCircle.y - 1000 );
		Temp.SetLength( ConstructionCircle.r - 6 );
		DrawDescriptionText( "2. Make this red circle who's diameter is the distance between the two circles", Temp.x2,  Temp.y2, BLACK, 30 );
	}
	else if( ConstructionIndex == 3 )
	{
		var Temp = new Line( BigCircleInner.x,  BigCircleInner.y, BigCircleInner.x - 500,  BigCircleInner.y - 1000 );
		Temp.SetLength( BigCircleInner.r - 6 );
		DrawDescriptionText( "3. Make a copy of the bigger of the two circles and then shrink it by the radius of the smaller of the two circles to get this blue circle", Temp.x2,  Temp.y2, BLACK, 250 );
	}
	else if( ConstructionIndex == 4 )
		DrawDescriptionText( "4. Construct a red line from the last intersection point in green to the center of the smaller of the two circles", TempPoint.x, TempPoint.y, BLACK, 50 );
	else if( ConstructionIndex == 5 )
		DrawDescriptionText( "5. Move both ends of the red line the same amount so that the red line starts at the red square on the edge of the big circle", constructionLine2.x2, constructionLine2.y2, BLACK, 50 );
}

function PointOnArc( point, arc )
{
	var a1 = 0.0;
	var a2 = 0.0;
	if( arc.d < 0 )
	{
		a2 = atan2( arc.yStart - arc.y, arc.xStart - arc.x );
		a1 = atan2( arc.yEnd - arc.y, arc.xEnd - arc.x );
	}
	else
	{
		a1 = atan2( arc.yStart - arc.y, arc.xStart - arc.x );
		a2 = atan2( arc.yEnd - arc.y, arc.xEnd - arc.x );
	}
	if( a1 < 0 )
		a1 = PI2 + a1;
	if( a2 < 0 )
		a2 = PI2 + a2;
	
	var a3 = atan2( point.y - arc.y, point.x - arc.x );
	if( a3 < 0 )
		a3 = PI2 + a3;
	
	if( a1 <= a2 )
	{
		if( a3 >= a1 && a3 <= a2 )
			return true;
	}
	else
	{
		if( a3 >= a1 && a3 <= PI2 )
			return true;
		else if( a3 >= 0 && a3 <= a2 )
			return true;
	}
	return false;
}

function IntersectsArc( circle, arc )
{
	var ContructionCircle1 = new Circle( arc.x, arc.y, arc.r );

	var p1 = new Point( 0, 0, BLACK );
	var p2 = new Point( 0, 0, BLACK );

	if( intersects( circle, ContructionCircle1, p1, p2 ) )
	{
		if( !PointOnArc( p1, arc ) )
			p1 = null;
		if( !PointOnArc( p2, arc ) )
			p2 = null;
		
		return [p1,p2];
	}
	else
	{
		p1 = null;
		p2 = null;
		return [null,null];
	}
}

function DrawCamAtAngle( Angle, x, y, rBase, rNose, Length, rTangent )
{
	var Base = new Circle( x, y, rBase );
	var NoseCenter = new Point( x, y, 0 );
	MovePoint( NoseCenter, Angle, Length - rNose );
	var Nose = new Circle( NoseCenter.x, NoseCenter.y, rNose );
	
	var ArcArray = GetTangentCurves( Base, Nose, rTangent );
	
	if( ( ArcArray instanceof Array ) && ArcArray.length == 2 )
	{
		DrawArc( new Point( ArcArray[0].x, ArcArray[0].y, 0 ), rTangent, new Point( ArcArray[0].xStart, ArcArray[0].yStart, 0 ), 
		         new Point( ArcArray[0].xEnd, ArcArray[0].yEnd, 0 ), ArcArray[0].d, BLACK, 2 );
		DrawArc( new Point( ArcArray[1].x, ArcArray[1].y, 0 ), rTangent, new Point( ArcArray[1].xStart, ArcArray[1].yStart, 0 ), 
		         new Point( ArcArray[1].xEnd, ArcArray[1].yEnd, 0 ), ArcArray[1].d, BLACK, 2 );

		DrawArc( new Point( Base.x, Base.y, 0 ), Base.r, new Point( ArcArray[0].xStart, ArcArray[0].yStart, 0 ), 
		         new Point( ArcArray[1].xStart, ArcArray[1].yStart, 0 ), 1, BLACK, 2 );
		DrawArc( new Point( Nose.x, Nose.y, 0 ), Nose.r, new Point( ArcArray[1].xEnd, ArcArray[1].yEnd, 0 ), 
		         new Point( ArcArray[0].xEnd, ArcArray[0].yEnd, 0 ), 1, BLACK, 2 );
	}
}

function IntersectCam( circle, Angle, x, y, rBase, rNose, Length, rTangent )
{
	var Base = new Circle( x, y, rBase );
	var NoseCenter = new Point( x, y, 0 );
	MovePoint( NoseCenter, Angle, Length - rNose );
	var Nose = new Circle( NoseCenter.x, NoseCenter.y, rNose );
	
	var ArcArray = GetTangentCurves( Base, Nose, rTangent );
	
	var PointArray = [null,null];
	var IntersectionArray = [null,null,null,null,null,null,null,null];
	var IntersectionIndex = 0;
	
	var point = null;
	
	if( ( ArcArray instanceof Array ) && ArcArray.length == 2 )
	{
		PointArray = IntersectsArc( circle, ArcArray[0] );
		if( PointArray[0] != null )
			IntersectionArray[IntersectionIndex++] = PointArray[0];
		if( PointArray[1] != null )
			IntersectionArray[IntersectionIndex++] = PointArray[1];
		
		PointArray = IntersectsArc( circle, ArcArray[1] );
		if( PointArray[0] != null )
			IntersectionArray[IntersectionIndex++] = PointArray[0];
		if( PointArray[1] != null )
			IntersectionArray[IntersectionIndex++] = PointArray[1];

		var ConstructionArc1 = new Arc( new Point( Base.x, Base.y, 0 ), Base.r, new Point( ArcArray[0].xStart, ArcArray[0].yStart, 0 ), 
										new Point( ArcArray[1].xStart, ArcArray[1].yStart, 0 ), 1 );
		var ConstructionArc2 = new Arc( new Point( Nose.x, Nose.y, 0 ), Nose.r, new Point( ArcArray[0].xEnd, ArcArray[0].yEnd, 0 ), 
										new Point( ArcArray[1].xEnd, ArcArray[1].yEnd, 0 ), -1 );
		PointArray = IntersectsArc( circle, ConstructionArc1 );
		if( PointArray[0] != null )
			IntersectionArray[IntersectionIndex++] = PointArray[0];
		if( PointArray[1] != null )
			IntersectionArray[IntersectionIndex++] = PointArray[1];

		PointArray = IntersectsArc( circle, ConstructionArc2 );
		if( PointArray[0] != null )
			IntersectionArray[IntersectionIndex++] = PointArray[0];
		if( PointArray[1] != null )
			IntersectionArray[IntersectionIndex++] = PointArray[1];
		
		// Up to 8 intersection points possible, but usually less if the follower is placed correctly. Find the one that
		// is closest to the top of the canvas for our purposes here, knowing that the follower is dropping onto the cam from above.
		// If the follower could be any place, then we would need to figure out something about where it is expected to hit the cam
		// and work with the points based on that info.
		
		for( var Counter = 0; Counter < 8 && IntersectionArray[Counter] != null; ++Counter )
		{
			if( point == null || IntersectionArray[Counter].y < point.y )
				point = new Point( IntersectionArray[Counter].x, IntersectionArray[Counter].y, 0 );
		}
	}
	return point;
}

function GetTangentCurves( circle1, circle2, rTangent )
{
	var Tangent1 = null; // new Arc( new Point( 0, 0, 0 ), 0, new Point( 0, 0, 0 ), new Point( 0, 0, 0 ), 1 );
	var Tangent2 = null; // new Arc( new Point( 0, 0, 0 ), 0, new Point( 0, 0, 0 ), new Point( 0, 0, 0 ), 1 );
	
	var ContructionCircle1 = new Circle( circle1.x, circle1.y, rTangent - circle1.r );
	var ContructionCircle2 = new Circle( circle2.x, circle2.y, rTangent - circle2.r );

	if( ContructionCircle1.r > 0 && ContructionCircle2.r > 0 )
	{
		var p1 = new Point( 0, 0, BLACK );
		var p2 = new Point( 0, 0, BLACK );
		if( intersects( ContructionCircle1, ContructionCircle2, p1, p2 ) )
		{	
			var constructionLine1 = new Line( p1.x, p1.y, circle1.x, circle1.y );
			constructionLine1.SetLength( rTangent );
			var constructionLine2 = new Line( p1.x, p1.y, circle2.x, circle2.y );
			constructionLine2.SetLength( rTangent );
			//var StartAngle = atan2( constructionLine1.y2 - constructionLine1.y1, constructionLine1.x2 - constructionLine1.x1 );
			//var EndAngle = atan2( constructionLine2.y2 - constructionLine2.y1, constructionLine2.x2 - constructionLine2.x1 );
			//var TestAngle = EndAngle - StartAngle;
			//var Direction = TestAngle >=0 ? 1 : -1;
			Tangent1 = new Arc( new Point( p1.x, p1.y, 0 ), rTangent, constructionLine1.End(), constructionLine2.End(), -1 );

			constructionLine1 = new Line( p2.x, p2.y, circle1.x, circle1.y );
			constructionLine1.SetLength( rTangent );
			constructionLine2 = new Line( p2.x, p2.y, circle2.x, circle2.y );
			constructionLine2.SetLength( rTangent );
			//StartAngle = atan2( constructionLine1.y2 - constructionLine1.y1, constructionLine1.x2 - constructionLine1.x1 );
			//EndAngle = atan2( constructionLine2.y2 - constructionLine2.y1, constructionLine2.x2 - constructionLine2.x1 );
			//TestAngle = EndAngle - StartAngle;
			//Direction = TestAngle >=0 ? 1 : -1;
			Tangent2 = new Arc( new Point( p2.x, p2.y, 0 ), rTangent, constructionLine1.End(), constructionLine2.End(), 1 );
		}
	}

	return [Tangent1, Tangent2];
}

function DrawCircleTangent2()
{
	if( DragPoint == 40 )
	{
		dragpoints[41].x += xOffset;
		dragpoints[41].y += yOffset;
	}
	else if( DragPoint == 42 )
	{
		dragpoints[43].x += xOffset;
		dragpoints[43].y += yOffset;
	}
	
	var Circle1 = new Circle( dragpoints[40].x, dragpoints[40].y, utils.distance( dragpoints[41], dragpoints[40] ) );
	var Circle2 = new Circle( dragpoints[42].x, dragpoints[42].y, utils.distance( dragpoints[43], dragpoints[42] ) );

	Circle1.Draw( BLACK, 2 );
	Circle2.Draw( BLACK, 2 );

	var TangentRadius = 400;
	
	var ContructionCircle1 = new Circle( dragpoints[40].x, dragpoints[40].y, TangentRadius - Circle1.r );
	var ContructionCircle2 = new Circle( dragpoints[42].x, dragpoints[42].y, TangentRadius - Circle2.r );
	
	if( ContructionCircle1.r > 0 )
		ContructionCircle1.Draw( GREEN, 1 );
	if( ContructionCircle2.r > 0 )
		ContructionCircle2.Draw( YELLOW, 1 );

	if( ContructionCircle1.r > 0 && ContructionCircle2.r > 0 )
	{
		var p1 = new Point( 0, 0, BLACK );
		var p2 = new Point( 0, 0, BLACK );
		if( intersects( ContructionCircle1, ContructionCircle2, p1, p2 ) )
		{	
			DrawSquare( p2, POINTRADIUS, BOLDRED );
			var TangentCircle = new Circle( p2.x, p2.y, TangentRadius );
			TangentCircle.Draw( RED, 1 );
			
			var constructionLine1 = new Line( p2.x, p2.y, Circle1.x, Circle1.y );
			constructionLine1.SetLength( TangentRadius );
			constructionLine1.Draw( GREEN );
			DrawSquare( constructionLine1.End(), POINTRADIUS, BOLDRED );

			var constructionLine2 = new Line( p2.x, p2.y, Circle2.x, Circle2.y );
			constructionLine2.SetLength( TangentRadius );
			constructionLine2.Draw( YELLOW );
			DrawSquare( constructionLine2.End(), POINTRADIUS, BOLDRED );

			var StartAngle = atan2( constructionLine1.y2 - constructionLine1.y1, constructionLine1.x2 - constructionLine1.x1 );
			var EndAngle = atan2( constructionLine2.y2 - constructionLine2.y1, constructionLine2.x2 - constructionLine2.x1 );
			var TestAngle = EndAngle - StartAngle;
			var Direction = TestAngle >=0 ? 1 : -1;
			
			if( StartAngle != EndAngle )
				DrawArc( constructionLine2.Start(), TangentRadius, constructionLine1.End(), constructionLine2.End(), Direction, BOLDRED, 2 );
		}
	}
}

function DrawCamLobe( x, y, BaseRadius, NoseRadius, SideRadius, NoseDistance, Angle )
{
	
	
	var line = new Line( dragpoints[3].x,  dragpoints[3].y,  dragpoints[5].x,  dragpoints[5].y );
	
	var BaseRadius = 40;
	var TangentRadius = 1000 + BaseRadius;
	var TangentLine1 = new Line( dragpoints[6].x, dragpoints[6].y, dragpoints[3].x,  dragpoints[3].y );
	
	var camlength = document.forms[0].elements['camlength'];	
	if( camlength != undefined && camlength != null )
		camlength.value = ( line.Length() + BaseRadius ).toFixed( 3 );
	var baseradius = document.forms[0].elements['baseradius'];	
	if( baseradius != undefined && baseradius != null )
		baseradius.value = BaseRadius.toFixed( 3 );
	var tangentradius = document.forms[0].elements['tangentradius'];	
	if( tangentradius != undefined && baseradius != null )
		tangentradius.value = TangentRadius.toFixed( 3 );
	var CenterlineAngle = atan2( line.y2 - line.y1, line.x2 - line.x1 );
	var TangentLineAngle = atan2( TangentLine1.y2 - TangentLine1.y1, TangentLine1.x2 - TangentLine1.x1 );
	var TangentAngle = ( TangentLineAngle - CenterlineAngle ) * 57.295827908;
	if( TangentAngle > 360 )
		TangentAngle -= 360;
	else if( TangentAngle < 0 )
		TangentAngle += 360;
	var tangentangle = document.forms[0].elements['tangentangle'];	
	if( tangentangle != undefined && tangentangle != null )
		tangentangle.value = TangentAngle.toFixed( 3 );
		
	var noseradius = document.forms[0].elements['noseradius'];	
	
	DrawCircle( dragpoints[6], TangentRadius, RED, 1 );
	
	TangentLine1.SetLength( TangentRadius );
	TangentLine1.Draw( YELLOW );
	DrawSquare( TangentLine1.End(), POINTRADIUS, YELLOW );

	var MeasureLine = new Line( line.x2, line.y2, line.x1, line.y1 );
	MeasureLine.SetLength( TangentRadius );
	MeasureLine.Draw( BLUE );
	DrawSquare( MeasureLine.End(), POINTRADIUS, BLUE );
	
	var ConstructionLine1 = new Line( dragpoints[6].x, dragpoints[6].y, MeasureLine.End().x, MeasureLine.End().y );
	ConstructionLine1.Draw( GREEN );
	
	var ConstructionLine2 = Perpendicular( ConstructionLine1, -1 );
	ConstructionLine2.Move( MidPoint( ConstructionLine1 ) );
	ConstructionLine2.Draw( GREEN );
	DrawSquare( ConstructionLine2.End(), POINTRADIUS, GREEN );
	
	var Intersection = new Point();
	var Direction = Intersects( ConstructionLine2, MeasureLine, Intersection );
	if( Direction != 0 )
	{
		DrawSquare( Intersection, POINTRADIUS, BOLDRED );
		
		var TestDistance = utils.distance( dragpoints[6], dragpoints[5] );
		if( TestDistance < TangentRadius - 0.01 && line.Length() > BaseRadius + 0.01 )
		{
			var NoseRadius = utils.distance( line.End(), Intersection );
			
			var TangentLine2 = new Line( dragpoints[6].x, dragpoints[6].y, Intersection.x, Intersection.y );
			TangentLine2.SetLength( TangentRadius );
			TangentLine2.Draw( BLUE );
			DrawSquare( TangentLine2.End(), POINTRADIUS, BLUE );
			
			var StartAngle = atan2( TangentLine1.y2 - TangentLine1.y1, TangentLine1.x2 - TangentLine1.x1 );
			var EndAngle = atan2( TangentLine2.y2 - TangentLine1.y1, TangentLine2.x2 - TangentLine1.x1 );
			var TestAngle = EndAngle - StartAngle;
			var Direction = TestAngle >=0 ? 1 : -1;
			
			if( StartAngle != EndAngle )
				DrawArc( TangentLine2.Start(), TangentRadius, TangentLine1.End(), TangentLine2.End(), Direction, BOLDRED, 2 );

			DrawCircle( Intersection, NoseRadius, BOLDRED, 2 );
			
			noseradius.value = NoseRadius.toFixed( 3 );
		}
		else
			noseradius.value = "";
	}
	
	DrawCircle( dragpoints[3], BaseRadius, BLACK, 2 );
}

function DrawRunningCam()
{
	DrawCircle( new Point( 0, 0, 0 ), POINTRADIUS, BLACK, 1 );
	DrawCamAtAngle( RotationAngle, 0, 0, 45, 20, 75, 130 );
	
	var FollowerCircle = new Circle( 100, -64, 103 );
	DrawCircle( new Point( FollowerCircle.x, FollowerCircle.y, 0 ), POINTRADIUS, BLACK, 1 );
	//FollowerCircle.Draw( GREEN, 0.5 );
	
	var Intersection = IntersectCam( FollowerCircle, RotationAngle, 0, 0, 45, 20, 75, 130 );
	
	if( Intersection != null )
	{
		DrawCircle( new Point( Intersection.x, Intersection.y, 0 ), POINTRADIUS, RED, 2 );
		var ConstructionLine = new Line( FollowerCircle.x, FollowerCircle.y, Intersection.x, Intersection.y );
		
		var polar = CartesianToPolar( new Point( FollowerCircle.x, FollowerCircle.y, 0 ), new Point( Intersection.x, Intersection.y, 0 ) );
		var OppositeLength = 19.0;
		var AdjustmentAngle = asin( OppositeLength / ConstructionLine.Length() ); 
		polar.a += AdjustmentAngle;
		var point = PolarToCartesian( polar.a, polar.r );
		point.x += FollowerCircle.x;
		point.y += FollowerCircle.y;
		var ConstructionLine2 = new Line( FollowerCircle.x, FollowerCircle.y, point.x, point.y );
		var NewLength = sqrt( ( ConstructionLine.Length() * ConstructionLine.Length() ) - ( OppositeLength * OppositeLength ) );
		ConstructionLine2.SetLength( NewLength );
		var ConstructionLine3 = new Line( ConstructionLine2.x2, ConstructionLine2.y2, Intersection.x, Intersection.y );
		ConstructionLine2.Draw( RED, 2 );
		ConstructionLine3.Draw( RED, 2 );

	
		//DrawSquare( point, POINTRADIUS*2, BOLDRED, 2 );

	}
	
	if( !Pause )
		RotationAngle += PI2 / 360;
}

function DrawRightAngle( line, direction, color )
{
	var perp = Perpendicular( line, direction );
	perp.Move( line.Start() );
	perp.SetLength( POINTRADIUS * 2 );
	perp.Draw( color );

	var savePoint = new Point( perp.x2, perp.y2, 0 );

	var line2 = new Line( line.x1, line.y1, line.x2, line.y2 );
	line2.SetLength( POINTRADIUS * 2 );
	perp.Move( line2.End() );
	perp.Draw( color );
	var line3 = new Line( savePoint.x, savePoint.y, perp.x2, perp.y2 );
	line3.Draw( color );
}

var pinCount = 1;
var slotCount = 4;

function DrawGeneva()
{
	var pinCountElement = document.forms[0].elements['pincount'];	
	if( pinCountElement != undefined && pinCountElement != null && pinCountElement.value != "" )
		pinCount = pinCountElement.value;
	if( pinCount > 6 ) {
		pinCount = 6;
		pinCountElement.value = 6;
	} else if( pinCount < 1 ) {
		pinCount = 1;
		pinCountElement.value = 1;
	}
	var slotCountElement = document.forms[0].elements['slotcount'];	
	if( slotCountElement != undefined && slotCountElement != null && slotCountElement.value != "" )
		slotCount = slotCountElement.value;
	if( slotCount < 3 ) {
		slotCount = 3;
		slotCountElement.value = 3;
	}
	
	// A bunch of this stuff does not change during the simulation. It is only
	// changed by a change to the pin counter and/or slot count.

	//var pinCount = 1;
	//var slotCount = genevaSlotCount;
	var distanceToOutput = 100;
	var inputCenter = new Point( -50, 0, 0 );
	var outputCenter = new Point( -50 + distanceToOutput, 0, 0 );
	// JUST SET THE ANGLES TO MAKE THINGS SIMPLE
	var angleOutputToInput = PI; // 90 degrees from the zero cartesian angle.
	var angleInputToOutput = 0;
	
	// Get the angle between slots.
	var slotAngle = PI2 / slotCount;
	// Get the angle of a slot at the start position of the movement.
	// This is relative to the line from the output to the input and keep in mind that the engle of rotation of the output will be negative if the input is positive.
	var a1 = slotAngle * 0.5;
	var inputRadius = distanceToOutput * sin( a1 );
	// Pythagorean Theorem gets us the radius of the outout.
	var outputRadius = sqrt( (distanceToOutput*distanceToOutput) - (inputRadius*inputRadius) );
	// Get the angle of the pin at the start position of the movement.
	// The angles, PI/2 for the right angle of the triangle, a1 as the angle of the second corner, and a2 that is being calculated, should all add up to PI.
	var a2 = ( PI * 0.5 ) - a1;
	var inputAngleRange = a2 * 2;
	a2 = -a2; // Negate it since it's CCW to the zero angle from inpout to output.

	var a1Drawn = angleOutputToInput + a1;
	if( a1Drawn > PI2 ) {
		a1Drawn -= PI2;
	} else if( a1Drawn < 0 ) {
		a1Drawn += PI2;
	}
	var a2Drawn = angleInputToOutput + a2;
	if( a2Drawn > PI2 ) {
		a2Drawn -= PI2;
	} else if( a2Drawn < 0 ) {
		a2Drawn += PI2;
	}
	
	var constructionPoint1 = new Point( outputCenter.x, outputCenter.y );
	MovePoint( constructionPoint1, a1Drawn, outputRadius ); // MovePoint does the math backwards (positive clockwise instead of counter-clockwise) so negate the angle that was calculated with CCW being positive.
	var constructionLine1 = new Line( outputCenter.x, outputCenter.y, constructionPoint1.x, constructionPoint1.y );
	constructionLine1.Draw( BLUE );
	var tempLine = new Line( constructionLine1.x2, constructionLine1.y2, constructionLine1.x1, constructionLine1.y1 );
	DrawRightAngle( tempLine, 0, BLUE );
	
	var constructionLine2 = Perpendicular( constructionLine1, 1 );
	constructionLine2.Move( constructionLine1.End() );
	constructionLine2.SetLength( 200 );
	constructionLine2.Reverse();
	constructionLine2.SetLength( 400 );
	constructionLine2.Draw( BLUE );


	var multiplePinAngle = PI2 / pinCount;
	var Pin = new Point( inputCenter.x, inputCenter.y, 0 );
	//MovePoint( Pin, a2Drawn + RotationAngle, inputRadius );
	
	// Now for stuff that changes for every rotation angle change...
	
	
	// Figure out the output angle.
	// Determine the number of times a pin has rotated the output a full output step. It is the rotation angle fivided
	// by the pin count. The rotation angle mod the pin angle results in the angle of the pin that is in the slot or past the slot before
	// another pin enters the slot.
	var InputRotationRemainder = abs( RotationAngle ) % multiplePinAngle;
	var fullInputRotations = ( RotationAngle - InputRotationRemainder ) / multiplePinAngle;
	var outputRotations = -( fullInputRotations * pinCount / slotCount ); // THIS IS NEGATIVE because we know that the direction of input rotation is positive. This is a kludge.
	var outputAngle = outputRotations * PI2;
	
	// Check to see if another full output has happened because the input pin left the slot. If so, skip any partial movement ofthe output.
	if( InputRotationRemainder > inputAngleRange ) {
		outputAngle -= slotAngle; // Recall that the output is rotating negative relative to the input.
	} else {
		var pinLocation = new Point( inputCenter.x, inputCenter.y, 0 );
		MovePoint( pinLocation, a2Drawn + InputRotationRemainder, inputRadius );
		// Determine the angle from the center of the output to the pin.
		// No other calculations are needed other than to perhaps normalize the angle in some way.
		var outputAngleToPin = atan2( pinLocation.y - outputCenter.y, pinLocation.x - outputCenter.x ); // Y is reversed because the canvas coordinates have y being reversed from cartesian coordinates.
		if( outputAngleToPin < 0 ) {
			outputAngleToPin += PI2;
		}
		outputAngleToPin -= a1Drawn; // Get an angle that reflects how far from the start position the pin is at this time.
		//outputAngleToPin -= angleOutputToInput;
		//if( outputAngleToPin > PI2 ) {
		//	outputAngleToPin -= PI2;
		//}
		outputAngle += outputAngleToPin;
		//var temp = new Point( outputCenter.x, outputCenter.y );
		//MovePoint( temp, outputAngleToPin, outputRadius );
		//DrawCircle( temp, POINTRADIUS, RED, 2 );
	}
	var slotIncrementAngle = 0;
	for( slotCounter = 0; slotCounter < slotCount; slotCounter += 1 ) {
		var slotEnd = new Point( outputCenter.x, outputCenter.y );
		MovePoint( slotEnd, a1Drawn + outputAngle + slotIncrementAngle, outputRadius );
		var slot = new Line( outputCenter.x, outputCenter.y, slotEnd.x, slotEnd.y );
		slot.Draw( GREEN, 2 );
		slotIncrementAngle += slotAngle;
	}

	DrawCircle( inputCenter, inputRadius, GRAY, 1 );
	DrawCircle( outputCenter, outputRadius, BLACK, 1 );
	DrawCircle( inputCenter, POINTRADIUS, BLACK, 1 );
	DrawCircle( outputCenter, POINTRADIUS, BLACK, 1 );
	for( pinCounter = 0; pinCounter < pinCount; pinCounter += 1 ) {
		var pinLocation = new Point( inputCenter.x, inputCenter.y, 0 );
		MovePoint( pinLocation, a2Drawn + RotationAngle + ( multiplePinAngle * pinCounter ), inputRadius );
		DrawCircle( pinLocation, POINTRADIUS, BLACK, 1 );
	}
	
	// Check for invalid pin-slot counts.
	// The small adjustment is because PI is not perfectly precise and there's a tiny difference
	// with 6 pins vs. 3 slots that should not be there in teh numbers.
	if( multiplePinAngle < ( PI - slotAngle - 0.0000000000001 ) ) {
		RotationAngle = 0;
		return;
	}
	
	if( !Pause )
		RotationAngle += PI2 / 360;
}


function ClosestBezierPoints( test, point0, point1, point2, point3, start, end, step )
{
	if( start < 0.0 )
	{
		start = 0.0
	}
	if( end > 1.0 )
	{
		end = 1.0
	}
	var steps = 10;
	var best = start
	var secondBest = end
	var bestDistance = Number.MAX_VALUE;
	var secondBestDistance = Number.MAX_VALUE;
	var step = ( end - start ) / steps;
	for( var parameter = start; parameter < end + step; parameter += step )
	{
		// Ensure that the end value is always tested since rounding errors could otherwise cause it to be skipped.
		var useParameter = min( end, parameter )
		var curvePoint = GetBezierPoint( point0, point1, point2, point3, useParameter );
		var dx = curvePoint.x - test.x;
		var dy = curvePoint.y - test.y;
		var squaredDistance = dx * dx + dy * dy;
		if( squaredDistance < bestDistance )
		{
			secondBest = best
			secondBestDistance = bestDistance;
			bestDistance = squaredDistance;
			best = useParameter;
		} else if( squaredDistance < secondBestDistance )
		{
			secondBest = useParameter;
			secondBestDistance = squaredDistance;
		}
	}
	return [best,secondBest];
}

function ClosestBezierPoint( test, point0, point1, point2, point3 )
{
	var steps = 4;
	var step = 1.0 / steps;
	var bests = ClosestBezierPoints( test, point0, point1, point2, point3, 0.0, 1.0, step );
						  
	var best = bests[0];
	var second = bests[1];
	for( var check = 0; check < 4; check++ )
	{
		var start = best - step / 2;
		var end = best + step / 2;
		var useStep = ( end - start ) / steps;
		best = ClosestBezierPoints( test, point0, point1, point2, point3, start, end, useStep )[0];

		start = second - step / 2;
		end = second + step / 2;
		useStep = ( end - start ) / steps;
		second = ClosestBezierPoints( test, point0, point1, point2, point3, start, end, useStep )[0];
						  
		step = useStep;
	}
	var curvePoint1 = GetBezierPoint( point0, point1, point2, point3, best );
	var dx = curvePoint1.x - test.x;
	var dy = curvePoint1.y - test.y;
	var squaredDistance1 = dx * dx + dy * dy;
	var curvePoint2 = GetBezierPoint( point0, point1, point2, point3, second );
	dx = curvePoint2.x - test.x;
	dy = curvePoint2.y - test.y;
	var squaredDistance2 = dx * dx + dy * dy;

	if( squaredDistance2 < squaredDistance1 )
	{
		curvePoint1 = curvePoint2;
	}
						  
	return curvePoint1;
}
						  
function DrawSlowBezier()
{
	if( DragPoint == DragPointStart+4 )
	{
		dragpoints[DragPointStart+5].x += xOffset;
		dragpoints[DragPointStart+5].y += yOffset;
	}

	DrawBezier( dragpoints[DragPointStart+0], dragpoints[DragPointStart+1], dragpoints[DragPointStart+2], dragpoints[DragPointStart+3], LIGHTGRAY );
	DrawPartialBezier( dragpoints[DragPointStart+0], dragpoints[DragPointStart+1], dragpoints[DragPointStart+2], dragpoints[DragPointStart+3], BLACK, ProportionalDistance );
	if( !Pause ) {
		ProportionalDistance += 0.002
		if( ProportionalDistance > 1.0 )
		{
			ProportionalDistance = 0.0
		}
	}
						  
	// Draw control lines for the control points.
	for( var Index = 0; Index < 2; Index += 3 )
	{
		var ControlLine1 = new Line( dragpoints[DragPointStart+Index].x,  dragpoints[DragPointStart+Index].y,  dragpoints[DragPointStart+Index+1].x,  dragpoints[DragPointStart+Index+1].y );
		var ControlLine2 = new Line( dragpoints[DragPointStart+Index+2].x,  dragpoints[DragPointStart+Index+2].y,  dragpoints[DragPointStart+Index+3].x,  dragpoints[DragPointStart+Index+3].y );
		ControlLine1.Draw( BLUE );
		ControlLine2.Draw( BLUE );
	}

	var closest = ClosestBezierPoint( dragpoints[DragPointStart+4], dragpoints[DragPointStart+0], dragpoints[DragPointStart+1], dragpoints[DragPointStart+2], dragpoints[DragPointStart+3] );
	var CloseLine = new Line( dragpoints[DragPointStart+4].x, dragpoints[DragPointStart+4].y, closest.x, closest.y );
	CloseLine.Draw( GREEN );
	DrawCircle( closest, POINTRADIUS, BOLDRED, 1 );

	var BaseRadius = utils.distance( dragpoints[DragPointStart+4], dragpoints[DragPointStart+5] );
	// Find the circle intersection to the bezier curve
	var intersections = CircleBezierIntersections( dragpoints[DragPointStart+4], BaseRadius, dragpoints[DragPointStart+0], dragpoints[DragPointStart+1], dragpoints[DragPointStart+2], dragpoints[DragPointStart+3] );

	intersections.forEach( function( element ) {
		var curvePoint = GetBezierPoint( dragpoints[DragPointStart+0], dragpoints[DragPointStart+1], dragpoints[DragPointStart+2], dragpoints[DragPointStart+3], element );
		DrawSquare( curvePoint, POINTRADIUS, RED );
	});




	DrawCircle( dragpoints[DragPointStart+4], BaseRadius, GRAY, 1 );
}

function DrawArcOnLines()
{
	var line1 = new Line( dragpoints[DragPointStart].x,  dragpoints[DragPointStart].y,  dragpoints[DragPointStart+1].x,  dragpoints[DragPointStart+1].y );
	var line2 = new Line( dragpoints[DragPointStart+2].x,  dragpoints[DragPointStart+2].y,  dragpoints[DragPointStart+3].x,  dragpoints[DragPointStart+3].y );
	
	var testLine1 = new Line( line1.x2, line1.y2, line1.x1, line1.y1 );
	testLine1.SetLength( -line1.Length() )
	var testLine2 = new Line( line2.x2, line2.y2, line2.x1, line2.y1 );
	testLine2.SetLength( -line2.Length() )
	
	//var TempLine = new Line( line1.x1, line1.y1, line1.x2, line1.y2 );
	//TempLine.Move( line1.End() );
	//TempLine.Draw( GREEN );
	//DrawSquare( TempLine.End(), POINTRADIUS, GREEN );

	var Intersection = new Point();
	var Direction = Intersects( testLine1, testLine2, Intersection );
	
	if( Direction == 0 )
	{
		// Parallel lines.

		Direction = Intersects( testLine1, testLine2, Intersection );
		
		var constructionLine1 = Perpendicular( line1, 1 );
		constructionLine1.Move( line1.End() );
		constructionLine1.SetLength( 150 );
		constructionLine1.Draw( GREEN );
		DrawSquare( constructionLine1.End(), POINTRADIUS, GREEN );
		
		var CurveIntersection = new Point();
		var CurveDirection = Intersects( constructionLine1, line2, CurveIntersection );
		if( CurveDirection != 0 )
		{
			DrawSquare( CurveIntersection, POINTRADIUS, RED );
			
			var CurveRadius = utils.distance( constructionLine1.Start(), CurveIntersection ) / 2;

			constructionLine1.SetLength( CurveRadius );
			
			DrawSquare( constructionLine1.End(), POINTRADIUS, BOLDRED );
			DrawCircle( constructionLine1.End(), CurveRadius, RED, 1 );
			
			DrawArc( constructionLine1.End(), CurveRadius, constructionLine1.Start(), CurveIntersection, CurveDirection, BOLDRED, 2 );
		}
	}
	else
	{
		DrawSquare( Intersection, POINTRADIUS, BOLDRED );
		
		var distance1 = utils.distance( Intersection, dragpoints[DragPointStart+1] );
		var distance2 = utils.distance( Intersection, dragpoints[DragPointStart+3] );
		
		var distance3 = utils.distance( Intersection, dragpoints[DragPointStart+0] );
		var distance4 = utils.distance( Intersection, dragpoints[DragPointStart+2] );
		var onSegment1 = distance3 < line1.Length()
		var onSegment2 = distance4 < line2.Length()
		var flipIt = onSegment1 || onSegment2
		flipIt = false // Not working with just this - the distance calculation is not enough info to know fi the lines cross somewhere out from their start points.
		if( flipIt ) { 
			Direction = ( Direction < 0 ? 1 : -1 )
		}
		
		var distance = Direction == 1 ? min( distance1, distance2 ) : max( distance1, distance2 );
		var comesUpShort = distance1 > distance2 ? ( Direction > 0 ? 1 : 2 ) : ( Direction > 0 ? 2 : 1 );
		
		DrawCircle( Intersection, distance, YELLOW, 1 );
		
		var tempLine = new Line( Intersection.x, Intersection.y, dragpoints[DragPointStart+1].x,  dragpoints[DragPointStart+1].y )
		tempLine.SetLength( distance );
		DrawSquare( tempLine.End(), POINTRADIUS, GREEN );
		
		var constructionLine1 = Perpendicular( line1, 1 );
		constructionLine1.Move( tempLine.End() );
		constructionLine1.SetLength( 150 );
		constructionLine1.Draw( GREEN );
		DrawSquare( constructionLine1.End(), POINTRADIUS, GREEN );
		
		tempLine = new Line( Intersection.x, Intersection.y, dragpoints[DragPointStart+3].x,  dragpoints[DragPointStart+3].y )
		tempLine.SetLength( distance );
		DrawSquare( tempLine.End(), POINTRADIUS, GREEN );

		var constructionLine2 = Perpendicular( line2, 2 );
		constructionLine2.Move( tempLine.End() );
		constructionLine2.SetLength( 150 );
		constructionLine2.Draw( BLUE );
		DrawSquare( constructionLine2.End(), POINTRADIUS, BLUE );
		
		var arcCenter = new Point();
		var CurveDirection = Intersects( constructionLine1, constructionLine2, arcCenter );
		if( CurveDirection != 0 ) {
			DrawSquare( arcCenter, POINTRADIUS, BOLDRED );
			var CurveRadius = utils.distance( arcCenter, constructionLine1.Start() );
			DrawArc( arcCenter, CurveRadius, constructionLine1.Start(), constructionLine2.Start(), CurveDirection, BOLDRED, 2 );
			var gap;
			if( comesUpShort == 1 ) {
				gap = new Line( constructionLine1.Start().x, constructionLine1.Start().y, line1.End().x, line1.End().y );
			} else {
				gap = new Line( constructionLine2.Start().x, constructionLine2.Start().y, line2.End().x, line2.End().y );
			}	
			gap.Draw( BOLDRED, 2 );		
		}
		
		/*var MeasureLine = new Line( line2.x1, line2.y1, line2.x2, line2.y2 );
		MeasureLine.Move( Intersection );
		MeasureLine.SetLength( Radius );
		DrawSquare( MeasureLine.End(), POINTRADIUS, BLUE );
		
		var constructionLine1 = Perpendicular( line1, 1 );
		constructionLine1.Move( line1.End() );
		constructionLine1.SetLength( 150 );
		constructionLine1.Draw( GREEN );
		DrawSquare( constructionLine1.End(), POINTRADIUS, GREEN );
		
		var constructionLine2 = Perpendicular( MeasureLine, 1 );
		constructionLine2.Move( MeasureLine.End() );
		constructionLine2.SetLength( 150 );
		constructionLine2.Draw( BLUE );
		DrawSquare( constructionLine2.End(), POINTRADIUS, BLUE );
		
		var CurveIntersection = new Point();
		var CurveDirection = Intersects( constructionLine1, constructionLine2, CurveIntersection );
		if( CurveDirection != 0 )
		{
			DrawSquare( CurveIntersection, POINTRADIUS, BOLDRED );
			var CurveRadius = utils.distance( CurveIntersection, dragpoints[12] );
			
			DrawCircle( CurveIntersection, CurveRadius, RED, 1 );
			
			DrawArc( CurveIntersection, CurveRadius, dragpoints[12], MeasureLine.End(), CurveDirection, BOLDRED, 2 );
		}*/
	}
	
	line1.Draw( BLACK );
	line2.Draw( BLACK );
}



if (!Array.prototype.forEach) {
	Array.prototype.forEach = function(fn, scope) {
		for(var i = 0, len = this.length; i < len; ++i) {
			fn.call(scope, this[i], i, this);
		}
	}
}

function FindCircleCrossings( circlePoint, circleRadius, point0, point1, point2, point3, startParameter, endParameter, step, lineInterpolation )
{
	// Return any crossings found using the given parameters.
	// Find all places where the bezier points cross the circle radius.
	// Use fairly large stepping and the get accurate points using those crossings.
	var squaredRadiusDistance = circleRadius * circleRadius
	var crossings = [];
	var previousSquaredDistance = 0.0
	var previousPoint;
	var closestParameter = 0.0;
	var closestSquaredDistance = Number.MAX_VALUE;
	for( var parameter = startParameter; parameter < endParameter + step; parameter += step )
	{
		// Ensure that the end value is always tested sice rounding errors could otherwise cause it to be skipped.
		var useParameter = min( 1.0, parameter )
		var curvePoint = GetBezierPoint( point0, point1, point2, point3, useParameter );
		var dx = curvePoint.x - circlePoint.x;
		var dy = curvePoint.y - circlePoint.y;
		var squaredDistance = dx * dx + dy * dy;
		if( squaredDistance < closestSquaredDistance )
		{
			closestSquaredDistance = squaredDistance;
			closestParameter = parameter;
		}
		if( parameter != startParameter )
		{
			var larger = max( previousSquaredDistance, squaredDistance )
			var smaller = min( previousSquaredDistance, squaredDistance )
			if( larger >= squaredRadiusDistance && smaller < squaredRadiusDistance )
			{
				var crossing = parameter;
				if( lineInterpolation )
				{
					// The interpolation should only happen on the last iteration of the complete set of refinement steps.
					var distance1 = utils.distance( circlePoint, curvePoint );
					var distance2 = utils.distance( circlePoint, previousPoint );
					var distance3 = circleRadius
					distance3 -= distance1
					distance2 -= distance1
					distance1 -= distance1
					// Calculate a distance along the line between the points so that the point on that line is the radius distance from the circle center.
					var derp = distance3 / distance2
					var crossing = parameter - ( step * derp );
					// Crossing is now a curve location that is approximately the right distance from the center of the circle.
					// A very accurate point could be calcuated by only locations on the curve matter until the final steps of the algorithm.
				}
				crossings.push( crossing );
			}
		}
		previousSquaredDistance = squaredDistance
		previousPoint = curvePoint
	}
	if( crossings.length == 0 )
		crossings.push( closestParameter + ( step / 2 ) ); // Move to the end of the region that is suspected of being closest.
	return crossings;
}

function CircleBezierIntersections( circlePoint, circleRadius, point0, point1, point2, point3 )
{
	var steps = 50;
	var step = 1.0 / steps;
	var crossings = FindCircleCrossings( circlePoint, circleRadius, point0, point1, point2, point3, 0.0, 1.0, step, false );
	// Crossings are always the point just after a crossing and the point before can be obtained using the parameter - step value.
	// The crossing might represent a close location and not an actual crossing if there were none. A test is needed to ensure that the
	// final points are at the right distance.
	var newCrossings = [];

	crossings.forEach( function( element ) {
		var range = step;
		var useStep = range / 4; // Don't need a lot of steps now that the crossing is a sure-thing. Even a binary search would work here (two steps).
		// Element is a curve location value between 0.0 and 1.0.
		// Refine each crossing using the same algorithm on a smaller portion of the curve.
		var crossing = element
		var iterations = 8;
		for( var level = 1; level <= iterations; level++ )
		{
			var temp = FindCircleCrossings( circlePoint, circleRadius, point0, point1, point2, point3, crossing - range, crossing, useStep, level == iterations );
			// These refinement steps should only ever find a single point although an intersection right near the point of a curve could cause a problem!
			crossing = temp[0]
			range = useStep
			useStep = range / steps
		}
		// The new crossing might just be a close location if there were never any crossings. Test the distance and include the point
		// if it's close to the circle radius. An actual distance should be used here (not squared).
		var curvePoint = GetBezierPoint( point0, point1, point2, point3, crossing );
		var pointDistance = utils.distance( curvePoint, circlePoint )
		var diff = abs( circleRadius - pointDistance )
		if( diff < 0.0001 )
		{
			newCrossings.push( crossing );
		}
		//var curvePoint = GetBezierPoint( point0, point1, point2, point3, element );
		//DrawSquare( curvePoint, POINTRADIUS, RED );
	});
	return newCrossings;
}

function DrawChordRadius()
{
	var ConstructionLine1 = new Line( dragpoints[29].x, dragpoints[29].y, dragpoints[31].x, dragpoints[31].y );
	ConstructionLine1.Draw( GREEN );

	// Snap the arc drag point to a line that is midway between the two arc ends.
	var PerpLine = Perpendicular( ConstructionLine1, -1 );
	PerpLine.Move( MidPoint( ConstructionLine1 ) );
	var TestLine = new Line( dragpoints[29].x, dragpoints[29].y, dragpoints[31].x, dragpoints[31].y );
	TestLine.Move( dragpoints[30] );
	var Intersection = new Point();
	var Direction = Intersects( PerpLine, TestLine, Intersection );
	if( Direction == 0 )
		Intersection = MidPoint( ConstructionLine1 );
		
	dragpoints[30].x = Intersection.x;
	dragpoints[30].y = Intersection.y;
	
	// Compute the radius.
	var ConstructionLine2 = new Line( dragpoints[30].x, dragpoints[30].y, MidPoint( ConstructionLine1 ).x, MidPoint( ConstructionLine1 ).y );

	var DistanceFromChord = utils.distance( dragpoints[30], MidPoint( ConstructionLine1 ) );
	var ChordLength = utils.distance( dragpoints[29], dragpoints[31] );
	
	var Radius = ( ( ( DistanceFromChord * DistanceFromChord ) + ( ( ChordLength * ChordLength ) * 0.25 ) ) ) / ( abs( DistanceFromChord ) * 2 );
	
	var ConstructionLine3 = new Line( dragpoints[30].x, dragpoints[30].y, MidPoint( ConstructionLine1 ).x, MidPoint( ConstructionLine1 ).y );
	
	ConstructionLine3.SetLength( Radius );
	
	ConstructionLine3.Draw( RED );

	ConstructionLine2.Draw( YELLOW );

	DrawSquare( ConstructionLine3.End(), POINTRADIUS, RED );
	
	DrawArc( ConstructionLine3.End(), Radius, dragpoints[29], dragpoints[31], Direction, BOLDRED, 2 );
}

function DrawCamLobe()
{
	if( DragPoint == 3 )
	{
		dragpoints[4].x += xOffset;
		dragpoints[4].y += yOffset;
	}

	var line = new Line( dragpoints[3].x,  dragpoints[3].y,  dragpoints[5].x,  dragpoints[5].y );
	
	var BaseRadius = utils.distance( dragpoints[3], dragpoints[4] );
	var TangentRadius = utils.distance( dragpoints[3], dragpoints[6] ) + BaseRadius;
	var TangentLine1 = new Line( dragpoints[6].x, dragpoints[6].y, dragpoints[3].x,  dragpoints[3].y );
	
	var camlength = document.forms[0].elements['camlength'];	
	if( camlength != undefined && camlength != null )
		camlength.value = ( line.Length() + BaseRadius ).toFixed( 3 );
	var baseradius = document.forms[0].elements['baseradius'];	
	if( baseradius != undefined && baseradius != null )
		baseradius.value = BaseRadius.toFixed( 3 );
	var tangentradius = document.forms[0].elements['tangentradius'];	
	if( tangentradius != undefined && baseradius != null )
		tangentradius.value = TangentRadius.toFixed( 3 );
	var CenterlineAngle = atan2( line.y2 - line.y1, line.x2 - line.x1 );
	var TangentLineAngle = atan2( TangentLine1.y2 - TangentLine1.y1, TangentLine1.x2 - TangentLine1.x1 );
	var TangentAngle = ( TangentLineAngle - CenterlineAngle ) * 57.295827908;
	if( TangentAngle > 360 )
		TangentAngle -= 360;
	else if( TangentAngle < 0 )
		TangentAngle += 360;
	var tangentangle = document.forms[0].elements['tangentangle'];	
	if( tangentangle != undefined && tangentangle != null )
		tangentangle.value = TangentAngle.toFixed( 3 );
		
	var noseradius = document.forms[0].elements['noseradius'];	
	
	DrawCircle( dragpoints[6], TangentRadius, RED, 1 );
	
	TangentLine1.SetLength( TangentRadius );
	TangentLine1.Draw( YELLOW );
	DrawSquare( TangentLine1.End(), POINTRADIUS, YELLOW );

	var MeasureLine = new Line( line.x2, line.y2, line.x1, line.y1 );
	MeasureLine.SetLength( TangentRadius );
	MeasureLine.Draw( BLUE );
	DrawSquare( MeasureLine.End(), POINTRADIUS, BLUE );
	
	var ConstructionLine1 = new Line( dragpoints[6].x, dragpoints[6].y, MeasureLine.End().x, MeasureLine.End().y );
	ConstructionLine1.Draw( GREEN );
	
	var ConstructionLine2 = Perpendicular( ConstructionLine1, -1 );
	ConstructionLine2.Move( MidPoint( ConstructionLine1 ) );
	ConstructionLine2.Draw( GREEN );
	DrawSquare( ConstructionLine2.End(), POINTRADIUS, GREEN );
	
	var Intersection = new Point();
	var Direction = Intersects( ConstructionLine2, MeasureLine, Intersection );
	if( Direction != 0 )
	{
		DrawSquare( Intersection, POINTRADIUS, BOLDRED );
		
		var TestDistance = utils.distance( dragpoints[6], dragpoints[5] );
		if( TestDistance < TangentRadius - 0.01 && line.Length() > BaseRadius + 0.01 )
		{
			var NoseRadius = utils.distance( line.End(), Intersection );
			
			var TangentLine2 = new Line( dragpoints[6].x, dragpoints[6].y, Intersection.x, Intersection.y );
			TangentLine2.SetLength( TangentRadius );
			TangentLine2.Draw( BLUE );
			DrawSquare( TangentLine2.End(), POINTRADIUS, BLUE );
			
			var StartAngle = atan2( TangentLine1.y2 - TangentLine1.y1, TangentLine1.x2 - TangentLine1.x1 );
			var EndAngle = atan2( TangentLine2.y2 - TangentLine1.y1, TangentLine2.x2 - TangentLine1.x1 );
			var TestAngle = EndAngle - StartAngle;
			var Direction = TestAngle >=0 ? 1 : -1;
			
			if( StartAngle != EndAngle )
				DrawArc( TangentLine2.Start(), TangentRadius, TangentLine1.End(), TangentLine2.End(), Direction, BOLDRED, 2 );

			DrawCircle( Intersection, NoseRadius, BOLDRED, 2 );
			
			noseradius.value = NoseRadius.toFixed( 3 );
		}
		else
			noseradius.value = "";
	}
	
	DrawCircle( dragpoints[3], BaseRadius, BLACK, 2 );
}

function DrawLineToCircle()
{
	if( DragPoint == 9 )
	{
		dragpoints[10].x += xOffset;
		dragpoints[10].y += yOffset;
	}

	var line = new Line( dragpoints[7].x,  dragpoints[7].y,  dragpoints[8].x,  dragpoints[8].y );
	
	var Radius = utils.distance( dragpoints[9], dragpoints[10] );
	DrawCircle( dragpoints[8], Radius, YELLOW, 1 );
	
	var constructionLine1 = Perpendicular( line, -1 );
	constructionLine1.SetLength( Radius );
	constructionLine1.Draw( BLUE );
	DrawSquare( constructionLine1.End(), POINTRADIUS, BLUE );
	
	var constructionLine2 = new Line( constructionLine1.x2, constructionLine1.y2, dragpoints[9].x, dragpoints[9].y );
	constructionLine2.Draw( BLUE );
	
	constructionLine1.Reverse();
	constructionLine1.Move( constructionLine1.End() );
	constructionLine1.SetLength( 200 );
	constructionLine1.Draw( BLUE );
	DrawSquare( constructionLine1.End(), POINTRADIUS, BLUE );

	var constructionLine3 = Perpendicular( constructionLine2, 1 );
	constructionLine3.Move( MidPoint( constructionLine2 ) );
	constructionLine3.SetLength( 250 );
	
	constructionLine3.Draw( GREEN );
	DrawSquare( constructionLine3.End(), POINTRADIUS, GREEN );

	var Intersection = new Point();
	var Direction = Intersects( constructionLine1, constructionLine3, Intersection );
	if( Direction != 0 )
	{
		DrawSquare( Intersection, POINTRADIUS, BOLDRED );
		var NewRadius = utils.distance( dragpoints[8], Intersection );
		DrawCircle( Intersection, NewRadius, RED, 1 );
		
		var constructionLine4 = new Line( dragpoints[9].x, dragpoints[9].y, Intersection.x, Intersection.y );
		constructionLine4.Draw( YELLOW );
		var NewLength = Direction < 0 ? -Radius : Radius;
		var distance = utils.distance( dragpoints[8], dragpoints[9] );
		if( distance < Radius )
			NewLength = -NewLength;
		constructionLine4.SetLength( NewLength );
		DrawSquare( constructionLine4.End(), POINTRADIUS, RED );

		DrawArc( Intersection, NewRadius, dragpoints[8], constructionLine4.End(), Direction, BOLDRED, 2 );
	}
	
	line.Draw( BLACK );
	DrawCircle( dragpoints[9], Radius, BLACK, 2 );

}

function DrawLineToLine()
{
	var line1 = new Line( dragpoints[11].x,  dragpoints[11].y,  dragpoints[12].x,  dragpoints[12].y );
	var line2 = new Line( dragpoints[13].x,  dragpoints[13].y,  dragpoints[14].x,  dragpoints[14].y );
	
	var TempLine = new Line( line1.x1, line1.y1, line1.x2, line1.y2 );
	TempLine.Move( line1.End() );
	TempLine.Draw( GREEN );
	DrawSquare( TempLine.End(), POINTRADIUS, GREEN );

	var Intersection = new Point();
	var Direction = Intersects( line1, line2, Intersection );
	if( Direction == 0 )
	{
		// Parallel lines.

		Direction = Intersects( line1, line2, Intersection );
		
		var constructionLine1 = Perpendicular( line1, 1 );
		constructionLine1.Move( line1.End() );
		constructionLine1.SetLength( 150 );
		constructionLine1.Draw( GREEN );
		DrawSquare( constructionLine1.End(), POINTRADIUS, GREEN );
		
		var CurveIntersection = new Point();
		var CurveDirection = Intersects( constructionLine1, line2, CurveIntersection );
		if( CurveDirection != 0 )
		{
			DrawSquare( CurveIntersection, POINTRADIUS, RED );
			
			var CurveRadius = utils.distance( constructionLine1.Start(), CurveIntersection ) / 2;

			constructionLine1.SetLength( CurveRadius );
			
			DrawSquare( constructionLine1.End(), POINTRADIUS, BOLDRED );
			DrawCircle( constructionLine1.End(), CurveRadius, RED, 1 );
			
			DrawArc( constructionLine1.End(), CurveRadius, constructionLine1.Start(), CurveIntersection, CurveDirection, BOLDRED, 2 );
		}
	}
	else
	{
		DrawSquare( Intersection, POINTRADIUS, BOLDRED );
		
		var Radius = utils.distance( dragpoints[12], Intersection );
		DrawCircle( Intersection, Radius, YELLOW, 1 );
		
		var MeasureLine = new Line( line2.x1, line2.y1, line2.x2, line2.y2 );
		MeasureLine.Move( Intersection );
		MeasureLine.SetLength( Radius );
		DrawSquare( MeasureLine.End(), POINTRADIUS, BLUE );
		
		var constructionLine1 = Perpendicular( line1, 1 );
		constructionLine1.Move( line1.End() );
		constructionLine1.SetLength( 150 );
		constructionLine1.Draw( GREEN );
		DrawSquare( constructionLine1.End(), POINTRADIUS, GREEN );
		
		var constructionLine2 = Perpendicular( MeasureLine, 1 );
		constructionLine2.Move( MeasureLine.End() );
		constructionLine2.SetLength( 150 );
		constructionLine2.Draw( BLUE );
		DrawSquare( constructionLine2.End(), POINTRADIUS, BLUE );
		
		var CurveIntersection = new Point();
		var CurveDirection = Intersects( constructionLine1, constructionLine2, CurveIntersection );
		if( CurveDirection != 0 )
		{
			DrawSquare( CurveIntersection, POINTRADIUS, BOLDRED );
			var CurveRadius = utils.distance( CurveIntersection, dragpoints[12] );
			
			DrawCircle( CurveIntersection, CurveRadius, RED, 1 );
			
			DrawArc( CurveIntersection, CurveRadius, dragpoints[12], MeasureLine.End(), CurveDirection, BOLDRED, 2 );
		}
	}

	line1.Draw( BLACK );
	line2.Draw( BLACK );

	return;
	
	var constructionLine1 = Perpendicular( line, -1 );
	constructionLine1.SetLength( Radius );
	constructionLine1.Draw( BLUE );
	DrawSquare( constructionLine1.End(), POINTRADIUS, BLUE );
	
	var constructionLine2 = new Line( constructionLine1.x2, constructionLine1.y2, dragpoints[9].x, dragpoints[9].y );
	constructionLine2.Draw( BLUE );
	
	constructionLine1.Reverse();
	constructionLine1.Move( constructionLine1.End() );
	constructionLine1.SetLength( 200 );
	constructionLine1.Draw( BLUE );
	DrawSquare( constructionLine1.End(), POINTRADIUS, BLUE );

	var constructionLine3 = Perpendicular( constructionLine2, 1 );
	constructionLine3.Move( MidPoint( constructionLine2 ) );
	constructionLine3.SetLength( 250 );
	
	constructionLine3.Draw( GREEN );
	DrawSquare( constructionLine3.End(), POINTRADIUS, GREEN );

	var Intersection = new Point();
	var Direction = Intersects( constructionLine1, constructionLine3, Intersection );
	if( Direction != 0 )
	{
		DrawSquare( Intersection, POINTRADIUS, RED );
		var NewRadius = utils.distance( dragpoints[8], Intersection );
		DrawCircle( Intersection, NewRadius, RED, 1 );
		
		var constructionLine4 = new Line( dragpoints[9].x, dragpoints[9].y, Intersection.x, Intersection.y );
		constructionLine4.Draw( YELLOW );
		var NewLength = Direction < 0 ? -Radius : Radius;
		var distance = utils.distance( dragpoints[8], dragpoints[9] );
		if( distance < Radius )
			NewLength = -NewLength;
		constructionLine4.SetLength( NewLength );
		DrawSquare( constructionLine4.End(), POINTRADIUS, RED );

		DrawArc( Intersection, NewRadius, dragpoints[8], constructionLine4.End(), Direction, BOLDRED, 2 );
	}
	
	DrawCircle( dragpoints[9], Radius, BLACK, 2 );

}

Line.prototype.Start = function()
{
	return new Point( this.x1, this.y1 );
}

Line.prototype.End = function()
{
	return new Point( this.x2, this.y2 );
}

function MidPoint( line )
{
	return new Point( ( line.x1 + line.x2 ) / 2, ( line.y1 + line.y2 ) / 2 );
}

Line.prototype.SetLength = function( NewLength )
{
	var dx = this.x2 - this.x1;
	var dy = this.y2 - this.y1;
	var Length = sqrt( ( dx * dx ) + ( dy * dy ) );
	var Ratio = NewLength / Length;
	dx *= Ratio;
	dy *= Ratio;
	this.x2 = this.x1 + dx;
	this.y2 = this.y1 + dy;
}

Line.prototype.Extend = function( Add )
{
	var dx = this.x2 - this.x1;
	var dy = this.y2 - this.y1;
	var Length = sqrt( ( dx * dx ) + ( dy * dy ) );
	var Ratio = ( Length + Add ) / Length;
	dx *= Ratio;
	dy *= Ratio;
	this.x2 = this.x1 + dx;
	this.y2 = this.y1 + dy;
	this.x1 = this.x2 - ( dx * 2 );
	this.y1 = this.y2 - ( dy * 2 );
}

function MoveLine( line, point )
{
	var newline = new Line();
	newline.x2 = line.x2 - line.x1 + point.x;
	newline.y2 = line.y2 - line.y1 + point.y;
	newline.x1 = point.x;
	newline.y1 = point.y;
	return newline;
}

Line.prototype.Move = function( point )
{
	var Temp = MoveLine( this, point );
	this.x1 = Temp.x1;
	this.y1 = Temp.y1;
	this.x2 = Temp.x2;
	this.y2 = Temp.y2;
}

function MovePoint( point, angle, distance )
{
	var offset = getOffset( angle, distance );
	point.x += offset.x;
	point.y += offset.y;
}

function DrawCircle( point, radius, Color, LineWidth )
{
	circle = new Circle( point.x, point.y, radius );
	circle.Draw( Color, LineWidth );
}

function FillCircle( point, radius, Color )
{
	circle = new Circle( point.x, point.y, radius );
	circle.Fill( Color );
}

Circle.prototype.Draw = function( Color, LineWidth )
{
	var xc = world.width / 2;
	var yc = world.height / 2;
	context.strokeStyle = Color;
	context.lineWidth = 0.8;
	if( LineWidth > 1 )
		context.lineWidth += 0.7 * ( LineWidth - 1 );
	context.beginPath();
	context.arc( xc + this.x, yc + this.y, this.r, 0, Math.PI*2, false );
	context.stroke();
}

Circle.prototype.Fill = function( Color )
{
	var xc = world.width / 2;
	var yc = world.height / 2;
	context.strokeStyle = Color;
	context.fillStyle = Color;
	context.lineWidth = 0.8;
	if( Color == BLACK )
		context.lineWidth = 1.5;
	context.beginPath();
	context.arc( xc + this.x, yc + this.y, this.r, 0, Math.PI*2, false );
	context.stroke();
	context.fill();
}

function Arc( Center, Radius, Start, End, Direction )
{
	this.x = Center.x;
	this.y = Center.y;
	this.r = Radius;
	this.xStart = Start.x;
	this.yStart = Start.y;
	this.xEnd = End.x;
	this.yEnd = End.y;
	this.d = Direction;
}

function DrawArc( Center, Radius, Start, End, Direction, Color, LineWidth )
{
	var xc = world.width / 2;
	var yc = world.height / 2;
	context.strokeStyle = Color;
	context.lineWidth = 0.8;
	if( LineWidth > 1 )
		context.lineWidth += 0.7 * ( LineWidth - 1 );
	
	context.beginPath();
	
	if( Radius > 100000 )
	{
		context.moveTo( xc + Start.x, yc + Start.y );
		context.lineTo( xc + End.x, yc + End.y );
	}
	else
	{
		var StartAngle = atan2( Start.y - Center.y, Start.x - Center.x );
		var EndAngle = atan2( End.y - Center.y, End.x - Center.x );
		context.arc( xc + Center.x, yc + Center.y, Radius, StartAngle, EndAngle, Direction < 0 );
	}
	context.stroke();
}

function DrawDashedLine( line, color )
{
}

function utils.distance( point1, point2 )
{
	var dx = abs( point1.x - point2.x );
	var dy = abs( point1.y - point2.y );
	return sqrt( dx * dx + dy * dy );
}

Line.prototype.Length = function ()
{
	var dx = abs( this.x1 - this.x2 );
	var dy = abs( this.y1 - this.y2 );
	return sqrt( dx * dx + dy * dy );
}

Line.prototype.Reverse = function ()
{
	var tx = this.x2;
	var ty = this.y2;
	this.x2 = this.x1;
	this.y2 = this.y1;
	this.x1 = tx;
	this.y1 = ty;
}

function Point( x, y, color )
{
	if( x != undefined && x != null && y != undefined && y != null )
	{
		this.x = x;
		this.y = y;
	}
	else
	{
		this.x = 0.0;
		this.y = 0.0;
	}
	if( color != undefined && color != null )
		this.color = color;
	else
		this.color = BLACK;
}

function Circle( x, y, r )
{
	if( typeof( x ) == "object" )
	{
		if( x != undefined && x != null && x.x != undefined && x.x != null && x.y != undefined && x.y != null && x.r != undefined && x.r != null )
		{
			this.x = x.x;
			this.y = x.y;
			this.r = x.r;
		}
	}
	else
	{
		if( x != undefined && x != null && y != undefined && y != null && r != undefined && r != null )
		{
			this.x = x;
			this.y = y;
			this.r = r;
		}
		else
		{
			this.x = 0;
			this.y = 0;
			this.r = 0;
		}
	}
}

function Line( x1, y1, x2, y2 )
{
	if( x1 != undefined && x1 != null && y1 != undefined && y1 != null 
		&& x2 != undefined && x2 != null && y2 != undefined && y2 != null )
	{
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}
	else
	{
		this.x1 = 0;
		this.y1 = 0;
		this.x2 = 0;
		this.y2 = 0;
	}
}

function makeRGBA( r, g, b, a )
{
	return "rgba( " + floor( r ) + "," + floor( g ) + "," + floor( b ) + "," + a.toFixed( 8 ) + " )";
}
	
function makeRGB( r, g, b )
{
	return "rgb( " + floor( r ) + "," + floor( g ) + "," + floor( b ) + " )";
}

function getOffset( angle, distance )
{
	var cosine = cos( angle );
	var sine = sin( angle );
	return new Point( cosine * distance, sine * distance );
}

// shim with setTimeout fallback from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function UpdateCamLobeData()
{
	var camlength = document.forms[0].elements['camlength'];	
	if( camlength == undefined || camlength == null )
		return;
	var baseradius = document.forms[0].elements['baseradius'];	
	if( baseradius == undefined || baseradius == null )
		return;
	var tangentradius = document.forms[0].elements['tangentradius'];	
	if( tangentradius == undefined || baseradius == null )
		return;
	var tangentangle = document.forms[0].elements['tangentangle'];	
	if( tangentangle == undefined || tangentangle == null )
		return;

	var BaseRadius = max( parseFloat( baseradius.value ), 0 );
	var CamLength = max( parseFloat( camlength.value ), 0 );
	var TangentRadius = max( parseFloat( tangentradius.value ), 0 );
	TangentRadius -= BaseRadius;
	var TangentAngle = parseFloat( tangentangle.value );
	TangentAngle /= 57.295827908;
	
	var CenterlineLength = CamLength - BaseRadius;
	if( CenterlineLength < BaseRadius )
		CenterlineLength = BaseRadius;
	
	var Centerline = new Line( dragpoints[3].x,  dragpoints[3].y,  dragpoints[5].x,  dragpoints[5].y );
	Centerline.SetLength( CenterlineLength );
	dragpoints[5].x = Centerline.x2;
	dragpoints[5].y = Centerline.y2;
	
	var BaseRadiusLine = new Line( dragpoints[3].x,  dragpoints[3].y,  dragpoints[4].x,  dragpoints[4].y );
	BaseRadiusLine.SetLength( BaseRadius );
	dragpoints[4].x = BaseRadiusLine.x2;
	dragpoints[4].y = BaseRadiusLine.y2;

	var CenterlineAngle = atan2( Centerline.y2 - Centerline.y1, Centerline.x2 - Centerline.x1 );
	var TangentAngle = CenterlineAngle + TangentAngle;
	
	var x = TangentRadius * cos( TangentAngle );
	var y = TangentRadius * sin( TangentAngle );
	
	// Subtract the x.y because we are positiing the center of the tangent opposite of the location where the angle is computed.
	dragpoints[6].x = Centerline.x1 - x; 
	dragpoints[6].y = Centerline.y1 - y;
}

function handleCheckbox( cb ) 
{
	setTimeout( function() 
	{
		animBezier( cb.value );
	}, 0 );
}

function showSource()
{
    var source = "<html>";
    source += document.getElementsByTagName('html')[0].innerHTML;
    source += "</html>";
    //now we need to escape the html special chars, javascript has escape
    //but this does not do what we want
    source = source.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    //now we add <pre> tags to preserve whitespace
    source = "<pre>"+source+"</pre>";
    //now open the window and set the source as the content
    sourceWindow = window.open( "" );
    sourceWindow.document.write(source);
    sourceWindow.document.close(); //close the document for writing, not the window
	sourceWindow.document.title = window.location.href;
    //give source window focus
    if(window.focus) sourceWindow.focus();
}

function showConstructionDescriptions()
{
	if( document.getElementById( "showconstructiondescriptions" ).checked )
		ShowConstructionDescriptions = true;
	else
		ShowConstructionDescriptions = false;
	animate();
}

function LeftArrow()
{
	--ConstructionIndex;
	if( ConstructionIndex < 0 )
		ConstructionIndex = MaxConstructionDescriptions;
	UpdateDescriptionSelection();
	animate();
}

function RightArrow()
{
	++ConstructionIndex;
	if( ConstructionIndex > MaxConstructionDescriptions )
		ConstructionIndex = 0;
	UpdateDescriptionSelection();
	animate();
}

function UpdateDescriptionSelection()
{
	var TextElement = document.getElementById( 'stepnumber' );
	if( TextElement == null )
		return;
	TextElement.innerHTML = ( ConstructionIndex == 0 ? "none" : ConstructionIndex );
}

function updatedata()
{
	switch( DemoSelection )
	{
		case "endcurve":
			break;
		case "camlobe":
			UpdateCamLobeData();
			break;
		case "linetocircle":
			break;
		case "linetoline":
			break;
		case "beziercam":
			break;
		case "chordradius":
			break;
		case "circleintersect":
			break;
		case "circletangent":
			break;
		case "circletangent2":
			break;
		case "runningcam":
			break;
		case "slowbezier":
			break;
		case "arconlines":
			break;
	}
	animate();
}

function animBezier( name )
{
	var NewUrl = location.protocol + '//' + location.host + location.pathname;
	NewUrl += "?" + name;
	window.history.replaceState( { "html": NewUrl }, NewUrl, NewUrl );

	var textiocontainer = document.getElementById( 'textiocontainer' );
	var constructioncontainer = document.getElementById( 'constructioncontainer' );
	var endcurveio = document.getElementById( 'endcurveio' );
	var camlobeio = document.getElementById( 'camlobeio' );
	var linetocircleio = document.getElementById( 'linetocircleio' );
	var linetolineio = document.getElementById( 'linetolineio' );
	var beziercamio = document.getElementById( 'beziercamio' );
	var chordradiusio = document.getElementById( 'chordradiusio' );
	var circleintersectio = document.getElementById( 'circleintersectio' );
	var circletangentio = document.getElementById( 'circletangentio' );
	var circletangent2io = document.getElementById( 'circletangent2io' );
	var runningcam = document.getElementById( 'runningcamio' );
	var slowbezier = document.getElementById( 'slowbezierio' );
	var arconlines = document.getElementById( 'arconlinesio' );
	var genevaio = document.getElementById( 'genevaio' );

	endcurveio.style.display = "none";
	camlobeio.style.display = "none";
	linetocircleio.style.display = "none";
	linetolineio.style.display = "none";
	beziercamio.style.display = "none";
	chordradiusio.style.display = "none";
	circleintersectio.style.display = "none";
	circletangentio.style.display = "none";
	circletangent2io.style.display = "none";
	runningcamio.style.display = "none";
	slowbezierio.style.display = "none";
	arconlinesio.style.display = "none";
	genevaio.style.display = "none";

	DemoSelection = name;
	switch( name )
	{
		case null:
		case "":
			DemoSelection = "endcurve";
			ConstantAnimation = false;
		case "endcurve":
			DragPointStart = 0;
			DragPointCount = 3;
			endcurveio.style.display = "block";
			constructioncontainer.style.display = "block";
			ConstantAnimation = false;
			break;
		case "camlobe":
			DragPointStart = 3;
			DragPointCount = 4;
			camlobeio.style.display = "block";
			constructioncontainer.style.display = "none";
			ConstantAnimation = false;
			break;
		case "linetocircle":
			DragPointStart = 7;
			DragPointCount = 4;
			linetocircleio.style.display = "block";
			constructioncontainer.style.display = "none";
			ConstantAnimation = false;
			break;
		case "linetoline":
			DragPointStart = 11;
			DragPointCount = 4;
			linetolineio.style.display = "block";
			constructioncontainer.style.display = "none";
			ConstantAnimation = false;
			break;
		case "beziercam":
			DragPointStart = 15;
			DragPointCount = 14;
			beziercamio.style.display = "block";
			constructioncontainer.style.display = "none";
			ConstantAnimation = false;
			break;
		case "chordradius":
			DragPointStart = 29;
			DragPointCount = 3;
			chordradiusio.style.display = "block";
			constructioncontainer.style.display = "none";
			break;
		case "circleintersect":
			DragPointStart = 32;
			DragPointCount = 4;
			circleintersectio.style.display = "block";
			constructioncontainer.style.display = "none";
			ConstantAnimation = false;
			break;
		case "circletangent":
			DragPointStart = 36;
			DragPointCount = 4;
			circletangentio.style.display = "block";
			constructioncontainer.style.display = "block";
			ConstantAnimation = false;
			break;
		case "circletangent2":
			DragPointStart = 40;
			DragPointCount = 4;
			circletangent2io.style.display = "block";
			constructioncontainer.style.display = "none";
			ConstantAnimation = false;
			break;
		case "runningcam":
			DragPointStart = 0;
			DragPointCount = 0;
			runningcamio.style.display = "block";
			constructioncontainer.style.display = "none";
			ConstantAnimation = true;
			break;
		case "slowbezier":
			DragPointStart = 44;
			DragPointCount = 6;
			slowbezierio.style.display = "block";
			constructioncontainer.style.display = "none";
			ConstantAnimation = true;
			break;
		case "arconlines":
			DragPointStart = 50;
			DragPointCount = 4;
			arconlinesio.style.display = "block";
			constructioncontainer.style.display = "none";
			ConstantAnimation = false;
			break;
		case "geneva":
			DragPointStart = 0;
			DragPointCount = 0;
			genevaio.style.display = "block";
			constructioncontainer.style.display = "none";
			ConstantAnimation = true;
			break;
	}
	
	genevaSlotCount = 4;
	RotationAngle = 0;
	textiocontainer.style.display = "block";
	MaxConstructionDescriptions = 0; // gets set later.
	ConstructionIndex = 0;
	UpdateDescriptionSelection();

	animate();
}

function animate() 
{
	context.clearRect( 0, 0, canvas.width, canvas.height );
	
	switch( DemoSelection )
	{
		case "endcurve":
			DrawEndCurve();
			break;
		case "camlobe":
			DrawCamLobe();
			break;
		case "linetocircle":
			DrawLineToCircle();
			break;
		case "linetoline":
			DrawLineToLine();
			break;
		case "beziercam":
			DrawBezierCam();
			break;
		case "chordradius":
			DrawChordRadius();
			break;
		case "circleintersect":
			DrawCircleIntersect();
			break;
		case "circletangent":
			DrawCircleTangent();
			break;
		case "circletangent2":
			DrawCircleTangent2();
			break;
		case "runningcam":
			DrawRunningCam();
			break;
		case "slowbezier":
			DrawSlowBezier();
			break;
		case "arconlines":
			DrawArcOnLines();
			break;
		case "geneva":
			DrawGeneva();
			break;
	}
	
	// draw colored points on top of black points.
	for( var Index = DragPointStart; Index < DragPointStart + DragPointCount; ++Index )
	{
		if( dragpoints[Index].color != BLACK )
			continue;
		FillCircle( dragpoints[Index], POINTRADIUS, dragpoints[Index].color );
		//DrawText( "P" + Index, dragpoints[Index].x + POINTRADIUS, dragpoints[Index].y, dragpoints[Index].color );
	}
	for( var Index = DragPointStart; Index < DragPointStart + DragPointCount; ++Index )
	{
		if( dragpoints[Index].color == BLACK ) 
			continue;
		FillCircle( dragpoints[Index], POINTRADIUS, dragpoints[Index].color );
		//DrawText( "P" + Index, dragpoints[Index].x + POINTRADIUS, dragpoints[Index].y, dragpoints[Index].color );
	}
	
	xOffset = 0;
	yOffset = 0;
}

init();
