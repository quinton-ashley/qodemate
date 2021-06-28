# Qodemate

I want Qodemate to be a platform CS educators use to make interactive lessons. I made an algorithm that parses step number comments in the user's code so Qodemate can reproduce the program step by step.

## Simple Sample Project

```javascript
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
```

```markdown
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
```

## Result

```js
// simple_sample.js
function setup() {
  createCanvas(100, 100);
}
```

```js
// simple_sample.js
let ball = {
  x: 50,
  y: 50,
  r: 5, // radius
  d: 10 // diameter
};

function setup() {
  createCanvas(100, 100);
}
```

```js
// simple_sample.js
let ball = {
  x: 50,
  y: 50,
  r: 5, // radius
  d: 10 // diameter
};

function setup() {
  createCanvas(100, 100);
}

function draw() {
  ellipse(ball.x, ball.y, ball.d, ball.d);
}
```

```js
// simple_sample.js
let ball = {
  x: 50,
  y: 50,
  r: 5, // radius
  d: 10 // diameter
};

function setup() {
  createCanvas(100, 100);
}

function draw() {
  ball.x++;
  ellipse(ball.x, ball.y, ball.d, ball.d);
}
```

```js
// simple_sample.js
let ball = {
  x: 50,
  y: 50,
  r: 5, // radius
  d: 10 // diameter
};

function setup() {
  createCanvas(100, 100);
}

function draw() {
  ball.x--;
  ellipse(ball.x, ball.y, ball.d, ball.d);
} //2
```

## Goals

I also want Qodemate to be able to pull up documentation, install packages, run commands, and even do searches on StackOverflow! I also want steps to be able to be synced to video tutorials on Youtube, vimeo, etc outside a classroom setting to create interactive tutorial experiences outside the classroom.

I stopped working on this project in 2020 because I could never get copy/paste commands to work consistently with some IDEs and typing would trigger autocompletion which was a big problem too. I wanted to pivot to making a website where users could make interactive code presentation "videos" but someone has kind of already done that. Check out <https://ractive-player.org/> really cool stuff but not nearly as easy to use as I hope Qodemate would be.

Recently I've considered making Qodemate extensions for code editor apps, VS Code would be the first, and then having the Qodemate app communicate with the Qodemate extension to do the "typing" in the code editor app in a more controlled way. I could also do error checking by checking the files contents to make sure it's right. I've thought about changing the contents directly but some IDEs don't like that or wouldn't update quick enough.

## Why use Qodemate for presentations?

### Static Slide Presentations

- require a lot of prep work
- slides can only contain static screenshots or excerpts of code
- can't run the program at different points during the presentation

### Live Coding Presentations

- must be done from memory or improvised
- teaching a class and typing at the same time can be difficult

### Dynamic Qodemate Presentations

- fully choreograph a dynamic presentation (improv is optional)
- hit the spacebar or use a clicker like a powerpoint
- run code at any point during the presentation

## Installation Instructions for Developers

Gotta see it to believe it? I'm going to make a demo soon. You can also click on the releases tab and download the Qodemate app for your OS.

## How does it work?

Check out the wiki! More pages are coming soon.

## Getting Started

Download these test files. Right now only the jsTestFolder will work.  
<https://github.com/quinton-ashley/qodemate-test-files>
