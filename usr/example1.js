// Quinton Ashley
// https://www.youtube.com/watch?v=E7o1UpHH0c0
function setup() { //0 0:03
	createCanvas(windowWidth, windowHeight);
	example0();
}

function drawCaterpillar() { //1 0:08
	// initialize variables
	var radius = 50;
	// draw line
	ellipse(50, 50, radius, radius); //2 0:14 4
	ellipse(i, i, radius, radius); //4
	i += 10;
	// repeat //2
	ellipse(60, 60, radius, radius); //2 0:23
	ellipse(70, 70, radius, radius);
	ellipse(80, 80, radius, radius);
	ellipse(90, 90, radius, radius);
	ellipse(100, 100, radius, radius);
	ellipse(110, 110, radius, radius);
	ellipse(120, 120, radius, radius); //4 10
	ellipse(130, 130, radius, radius); //4
	ellipse(140, 140, radius, radius); //4 10
	ellipse(140, 140, radius, radius);
	ellipse(150, 150, radius, radius);
	ellipse(160, 160, radius, radius); //10
	ellipse(170, 170, radius, radius);
	ellipse(180, 180, radius, radius); //4
	ellipse(190, 190, radius, radius);
	ellipse(200, 200, radius, radius);
	ellipse(i, i, radius, radius);
	i += 10;
	ellipse(i, i, radius, radius);
	i += 10;
	ellipse(i, i, radius, radius);
	i += 10;
	ellipse(i, i, radius, radius);
	i += 10;
	ellipse(i, i, radius, radius);
	i += 10;
} //1

function example1() {
	// initialize variables //3 0:18
	var radius = 50;
	var i = 50;
	// draw line
	ellipse(i, i, radius, radius);
	i += 10;
	ellipse(i, i, radius, radius); //4
	i += 10;
	ellipse(i, i, radius, radius);
	i += 10;
	ellipse(i, i, radius, radius);
	i += 10;
	ellipse(i, i, radius, radius);
	i += 10;
	ellipse(i, i, radius, radius);
	i += 10;
} //1

function example2() {
	// initialize variables //5 1:40
	var radius = 50;
	// draw line
	for (var i = 50; i < 200; i += 10) {
		ellipse(i, i, radius, radius);
	}
} //1
