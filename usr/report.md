Quinton Ashley  
written May 18, 2017  
edited September 7, 2017
# Code Presenter in Detail
## The Idea
I started out with the idea, “Why isn’t there a powerpoint-like app that could write finished code step by step during a lesson into any IDE?” so I googled it and didn’t come up with anything, so I assumed it doesn’t exist and I’d have the opportunity to build it!  I eventually decided to make a local web app that a teacher could give a finished code file to as input, the app would look at special step annotations written in the file, and then the teacher would open up their IDE to a completely blank copy of the original project, then they could press the spacebar in my app, it would move the mouse to the file in the IDE, click on that file, write the step into that file, move the mouse back to the app, and wait for the next spacebar press.  Now I have much bigger plans for this project.  I want to 
## Planning/Early Development
After defining my goals last spring, I knew I could probably write the app using Java and the built-in Robot library.  However, I researched the possibility of using Javascript instead because I was more interested in using Javascript.  After I found out about node.js and npm I was set.  `robot-js` and `robotjs` are open source npm packages for node.js that have all the same functions as the awt.Robot library.  At first I only used `robotjs` which although really good for mouse stuff is not so reliable at the keyboard.  As of September 7th I use `robot-js` as well which is incredible for keyboard input but pretty horrible for mouse input.  They work well together!
## Step Parsing of Input Files
Step parsing is the foundation of Code Presenter and I had to learn a whole lot about regex before I finally wrote this little one liner that works.  I was fortunate enough to stumble upon these sites http://eloquentjavascript.net/09_regexp.html and https://regex101.com/ which really helped.
```javascript
let regex = /\n^.*\/\/\d+\w*/gm;
```
## Reproduction of Non-Sequential Multi-Part Steps
On 3/14 I wrote an important log:
#### "[Reproduction of Non-Sequential Multi-Part Steps] ... should be achieved.  I changed the example to be of the complexity I want this program to be able to handle."
Here’s the test document I made:
```javascript
// Quinton Ashley
function setup() { //0
	createCanvas(windowWidth, windowHeight);
	example0();
}

function example0() { //1
	// initialize variables
	var radius = 50;
	// draw line
	ellipse(50, 50, radius, radius); //2
	// repeat
	ellipse(60, 60, radius, radius); //4
	ellipse(70, 70, radius, radius);
	ellipse(80, 80, radius, radius);
	ellipse(90, 90, radius, radius);
	ellipse(100, 100, radius, radius);
	ellipse(110, 110, radius, radius);
	ellipse(120, 120, radius, radius);
	ellipse(130, 130, radius, radius);
	ellipse(140, 140, radius, radius);
	ellipse(150, 150, radius, radius);
	ellipse(160, 160, radius, radius);
	ellipse(170, 170, radius, radius);
	ellipse(180, 180, radius, radius);
	ellipse(190, 190, radius, radius);
	ellipse(200, 200, radius, radius);
} //1

function example1() {
	// initialize variables //3
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
	// initialize variables //5
	var radius = 50;
	// draw line
	for (var i = 50; i < 200; i += 10) {
		ellipse(i, i, radius, radius);
	}
} //1
```
There are several lines with these tags `//N`, a comment followed by a number with no space in between.  When the file is parsed with this regex `/\n^.*\/\/\d+\w*/gm`, the file is divided into step parts.  Read sequentially it has step parts in this order: 0124134151.  A step part starts on a line with a tag and ends before the next line with a tag.  There is only one part of step 0.  Note that step 1 and 4 have multiple parts.  It took me a while to tackle the problem of reproducing a file that has non-sequential multi-part steps but I think I found an elegant solution.  When I read in all the step parts I store them in `Step` objects.  I use just two arrays for the presenter algorithm. The first array, `seq` (sequence), stores the `Step` Objects in the order in which they are read. The other array, `set`, stores the Step objects in step number order (step parts with equivalent step numbers are kept in the `seq` order).  In each Step object I store: `num`, the step number of the part; `text`, the text of the step part; `type`, which I will write about later in the report; `lines`, the number of newline characters in the text of the step part; `fidx`, the file index; `seqidx`, the index of the step part in the `seq` array; and `setidx`, the index of the step part in the `set` array.  The `Presenter` class has a function that performs one part of a step called `performPart`.  On any step number besides 0 (a special case because it’s guaranteed the app can write all the step parts of the zeroth step sequentially) this function starts by defining references to the previous step part and current step part (`this.setidx++` occurs at the end of the function):
```javascript
const performPart = () => {
		let cur, past;
		let from = [];
		if (setidx >= 0) {
			past = set[setidx];
		} else {
			past = set[setidx + 1];
		}
		cur = set[setidx + 1];

		if (check && (cur.num != past.num)) {
			check = false;
			bot.focusOnApp();
			return false;
		}
		check = true;

		if (cur.num != 0) {
			from[0] = countLines(cur, 0, cur.seqidx);
			if (past.seqidx < cur.seqidx) {
				from[1] = countLines(cur, past.seqidx + 1, cur.seqidx);
			} else {
				from[1] = countLines(cur, cur.seqidx + 1, past.seqidx + 1);
			}
			from[2] = countLines(cur, cur.seqidx, seq.length);
			log(from);
			bot.move(from[1], ((past.seqidx < cur.seqidx) ? 'down' : 'up'));
			bot.moveToEOL();
		}
		log(cur);
		setidx++;
		var paste = () => {
			bot.paste();
			performStep().next();
		};
		ncp.copy(cur.text, paste);
		return true;
	}
```
The `countLines` function finds the distance between the lines of two step parts.  Only the lines of step parts with a `setidx` lower than the current step part will be counted.
```javascript
const countLines = (cur, init, dest) => {
	let result = 0;
	for (let i = init; i < dest; i++) {
		if (seq[i].setidx < cur.setidx) {
			result += seq[i].lines;
		}
	}
	return result;
}
```
I want the app to also be able to move from the top or bottom of the document because sometimes this will be faster than moving the cursor from the past step part.  For now I have this functionality disabled for simpler debugging.  The app moves `from[1]` value of lines either up or down from the end of the past step part and then copies the current step part's text to the clipboard.  I originally wanted the program to type out the step part but after testing this on editors with autocompletion it turned out to be a bad idea.
### Avoiding Callback Hell
One thing about node.js I was totally unfamiliar with before starting this project was callbacks and generators.  Luckily the `ncp` package, which manages the copying (the `cmd + v` key command is used to paste) accepts a callback program.  This prevents the async node.js program from trying to paste the code and move on before the text is copied to the clipboard.  Here's my generator function `performStep` of the `Presenter` class:
```javascript
*
performStep() {
	yield setTimeout(this.performPart, 100);
}
```
This paste function is called only when text has been copied:
```javascript
var paste = () => {
  bot.paste();
  performStep().next();
};
ncp.copy(cur.text, paste);
```
The timeout of 100ms is used so that the IDE recieving the pasted information has time to react.
### Different Types of Steps
I have yet to implement the `type` functionality of the Step objects.  The standard type will just write the step.  Delete types can be used to erase a step later.  `//2d13` could denote a part of step two that would be deleted during step 13.  `//er4` would write that part of step 4 and then run the program after all parts of step 4 were written.  `//e5` could denote an edit that would replace the step part above it.  Type combos could also be used.  Here's an excerpt of an example program I made that illustrates how useful the implementations of these types could be when doing a presentation:
```javascript
x = 10; //3 this is too far left!
x = 1000; //er4 this is too far right!
x = 100; //e5 perfect!
y = 40; //3
ellipse(x, y, 50, 50); //r3
```
I'm also going to very shortly add step parsing support to user created markdown documents so that step documentation or "slides" can be displayed in the web browser alongside the user's IDE.  That will be pretty easy to do.  I was talking to my friend Jason who is studying Statistics at UCSB and he said that if I made an export option that would output an html file with the step "slides" and code (kinda like this report) that it would be really useful for documenting code in blog posts. In the future I also want to enable people to make recordings for each step.  I think this could push the app beyond it's intended purpose of doing presentations and make it a viable platform to create fully interactive computer science textbooks with.  Whenever I watch a CS tutorial video on Youtube I've wished I could just jump right in and edit the code that person is working on.  With everything running on the student's machine via Code Presenter students could do exactly that!