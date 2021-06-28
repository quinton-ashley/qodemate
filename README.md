# Qodemate

I want Qodemate to be a platform CS educators use to make interactive lessons very easily. Qodemate should be able to write code step by step, pull up documentation, install packages, run commands, and even do searches on StackOverflow!

## Simple Sample Project

```javascript
// simple_sample.js
function setup() {
  //0
  console.log("setting up..."); //2
  let x = 30; //1
  let y = 50;
} //0
```

```markdown
# lesson.md

# setup function //0

Let's write the setup function!

# setup function //1

Initialize our x and y variables.

# setup function //2

Let's make sure to log what we're doing in the console.
```

## Result

```md
# setup function //0

Let's write the setup function!
```

```js
// simple_sample.js
function setup() {}
```

```md
# setup function //1

Initialize our x and y variables.
```

```js
// simple_sample.js
function setup() {
  let x = 30;
  let y = 50;
}
```

```md
# setup function //2

Let's make sure to log what we're doing in the console.
```

```js
// simple_sample.js
function setup() {
  console.log("setting up...");
  let x = 30;
  let y = 50;
}
```

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

Gotta see it to believe it? ~~Click on the releases tab and download the native Qodemate app for your OS.~~ **Qodemate is currently pre-beta, you must clone this repository and build yourself**

Install the LTS version of node.js and npm.

Windows Specific

    $ npm i -g windows-build-tools

macOS Specific

    $ xcode-select --install

All Systems

    $ git clone https://github.com/quinton-ashley/qodemate.git
    $ cd qodemate
    $ npm i -g node-gyp
    $ npm i
    $ npm start

## How does it work?

Check out the wiki! More pages are coming soon.

## Getting Started

Download these test files. Right now only the jsTestFolder will work.  
<https://github.com/quinton-ashley/qodemate-test-files>

## Future Features

### Video/Audio File Syncing

Steps synced to video tutorials on Youtube, vimeo, etc outside a classroom setting to create interactive tutorial experiences outside the classroom.
