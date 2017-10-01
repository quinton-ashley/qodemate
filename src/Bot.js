var Bot = function () {
	const mouse = require('robotjs');
	const robot = require('robot-js');
	let keyboard = robot.Keyboard();

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
		while (robot.Keyboard.getState(robot.KeySpace)) {}
		cb();
	}

	this.focusOnApp = () => {
		mouse.moveMouse(loc.app.x, loc.app.y);
		mouse.mouseClick();
	}

	this.focusOnFile = (fidx) => {
		mouse.moveMouse(loc.file[fidx].x, loc.file[fidx].y);
		mouse.mouseClick();
	}

	this.moveToStart = () => {
		log('moveToStart');
		keyboard.press(robot.KEY_SYSTEM);
		keyboard.click(robot.KEY_UP);
		keyboard.release(robot.KEY_SYSTEM);
	}

	this.moveToEOL = () => {
		log('moveToEOL');
		keyboard.press(robot.KEY_SYSTEM);
		keyboard.click(robot.KEY_RIGHT);
		keyboard.release(robot.KEY_SYSTEM);
	}

	this.moveToEnd = () => {
		log('moveToEnd');
		keyboard.press(robot.KEY_SYSTEM);
		keyboard.click(robot.KEY_DOWN);
		keyboard.release(robot.KEY_SYSTEM);
	}

	this.move = (lines, direction) => {
		log('moved ' + lines + ' ' + direction);
		direction = ((direction.match('up')) ? robot.KEY_UP : robot.KEY_DOWN);
		for (var i = 0; i < lines; i++) {
			keyboard.click(direction);
		}
	}

	this.paste = () => {
		keyboard.press(robot.KEY_SYSTEM);
		keyboard.click(robot.KEY_V);
		keyboard.release(robot.KEY_SYSTEM);
	};
}

module.exports = new Bot();
