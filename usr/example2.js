// Quinton Ashley
// https://www.youtube.com/watch?v=E7o1UpHH0c0
function setup() { //0 t0:03
	createCanvas(windowWidth, windowHeight); //0.1
	drawCaterpillar();
} //0

function drawCaterpillar() { //1 t0:08
	// initialize variables //2 t0:14
	var radius = 20; //2 2.1 =80; 2.2 =40; 2.3 =50;
	var i = 50; //4 5
	// draw line //2
	ellipse(50, 50, radius, radius); //2 4 (i, i, , )
	i += 10;
	// repeat //2
	ellipse(60, 60, radius, radius);
	ellipse(70, 70, radius, radius); //3 t0:23 4
	ellipse(80, 80, radius, radius);
	ellipse(90, 90, radius, radius);
	ellipse(100, 100, radius, radius);
	ellipse(110, 110, radius, radius);
	ellipse(120, 120, radius, radius); //3.1 t0:25
	ellipse(130, 130, radius, radius);
	ellipse(140, 140, radius, radius);
	ellipse(140, 140, radius, radius);
	ellipse(150, 150, radius, radius); //3.2 t0:28
	ellipse(160, 160, radius, radius);
	ellipse(170, 170, radius, radius);
	ellipse(180, 180, radius, radius);
	ellipse(190, 190, radius, radius);
	ellipse(200, 200, radius, radius);
	ellipse(i, i, radius, radius); //4 5
	i += 10;
	ellipse(i, i, radius, radius);
	i += 10;
	ellipse(i, i, radius, radius);
	i += 10;
	ellipse(i, i, radius, radius);
	i += 10;
	ellipse(i, i, radius, radius);
	i += 10;
	for (var i = 50; i < 200; i += 10) { //5
		ellipse(i, i, radius, radius);
	}
} //1
