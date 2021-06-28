let qm = new Qodemate();
qm.parseFile({
	base: 'simple_sample.js',
	name: 'simple_sample',
	ext: '.js'
}, `
// simple_sample.js //0
let ball = {
  x: 50,
  y: 50,
  r: 5, // radius
  d: 10 // diameter
};
//1
function setup() {
  createCanvas(100, 100);
}
//0
function draw() {
  //2
  ball.x++; //3 4
  ball.x--; //4
  ellipse(ball.x, ball.y, ball.d, ball.d);
} //2
`, 0);

qm.parseFile({
	base: 'lesson.md',
	name: 'lesson',
	ext: '.md'
}, `
# setup function //0

Start with the p5.js setup function, create a canvas 100w x 100h.

# ball Object //1

Let's make an object to store the ball's position and radius.

# draw function //2

Use the ellipse function inside the draw function to draw the ball.

# Animating the ball //3

To make the ball move to the right we can increment its x value.

# Animating the ball //4

To make the ball move to the right we can decrement its x value.
`, 1);

qm.init();

async function performPart() {
	let part = qm.nextPart();
	if (!part) {
		return false;
	}
	if (part.move) {
		if (part.move.from.end) {
			bot.moveToEnd();
		} else if (part.move.from.start) {
			bot.moveToStart();
		}
		bot.move(part.move.lines, part.move.direction);
		bot.moveToEOL();
	}
	if (part.deleteLines) {
		bot.deleteLines(part.deleteLines);
	}
	if (part.text) {
		await bot.copy(part.text);
		await bot.paste();
	}
	return true;
}

async function play() {
	await performPart();
	await delay(2000);
}

// play();
