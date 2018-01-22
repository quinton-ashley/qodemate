var Bot = function () {
	const robot = require('robotjs');
	//	robot.setKeyboardDelay(10);

	const log = console.log;

	let loc = {
		app: {
			x: 600,
			y: 600
		},
		file: [{
			x: 1150,
			y: 20
			}]
	};

	this.ensureKeysNotPressed = (cb) => {
		//		while (robot.Keyboard.getState(robot.KeySpace)) {}
		cb();
	}

	this.focusOnApp = () => {
		robot.moveMouse(loc.app.x, loc.app.y);
		robot.mouseClick();
	}

	this.focusOnFile = (fidx) => {
		robot.moveMouse(loc.file[fidx].x, loc.file[fidx].y);
		robot.mouseClick();
	}

	this.moveToStart = () => {
		log('moved to Start');
		robot.keyTap('up', 'command');
	}

	this.moveToEnd = () => {
		log('moved to End');
		robot.keyTap('down', 'command');
	}

	this.moveToBOL = () => {
		log('moved to BOL');
		robot.keyTap('left', 'command');
	}

	this.moveToEOL = () => {
		log('moved to EOL');
		robot.keyTap('right', 'command');
	}

	this.move = (lines, direction, mod) => {
		log('moved ' + lines + ' ' + direction);
		for (var i = 0; i < lines; i++) {
			if (mod) {
				robot.keyTap(direction, mod);
			} else {
				robot.keyTap(direction);
			}
		}
	}

	this.delete = (lines) => {
		this.move(1, 'down');
		this.moveToBOL();
		this.move(lines, 'up', 'shift');
		robot.keyTap('backspace');
		robot.keyTap('left');
		log('deleted');
	}

	this.paste = () => {
		robot.keyTap('v', 'command');
	};
}

module.exports = new Bot();
