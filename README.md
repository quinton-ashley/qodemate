# Qodemate

_I stopped working on this project in 2020 because I could never get copy/paste commands to work consistently with some IDEs and typing would trigger autocompletion which was a big problem too. I wanted to pivot to making a website where users could make interactive code presentation "videos" but someone has kind of already done that. Check out <https://ractive-player.org/> really cool stuff!_

_Recently I've considered making Qodemate extensions for code editor apps, VS Code would be the first, and then having the Qodemate app communicate with the Qodemate extension to do the "typing" in the code editor app._

I want Qodemate to be a dynamic CS presentation/textbook platform. In the future maybe it could even be a coding assistant you could talk to, hence the name.

## Goals

- with minimal prep work CS educators should be able to give fancy, multi-file, non-sequential, step sequenced reproduction presentations (like CodeAcademy)
- should make the process of coding transparent so CS educators can teach computer science, not just programming
- should work with fully featured development apps (like Eclipse, Adobe Brackets, Xcode, etc.) without using a sandboxed webpage (CodeAcademy, Hour of Code, Code Studio). Some sandboxed tutorial sites oversimplify things. They often have a lot of code running behind the scenes that users can't access. This results in students not knowing how to start their own projects outside of the site's sandboxed environment.
- should be able to pull up docs, install packages, run commands, and even do a search on StackOverflow

## Why should I use Qodemate?

### Static Slide Presentations

- require a lot of prep work
- slides can only contain static screenshots or excerpts of code
- can't run the program at different points during the presentation

### Live Coding Presentations

- must be done from memory or improvised
- teaching a class and typing at the same time can be difficult

### Dynamic Qodemate Presentations

- fully choreograph a dynamic presentation (improv is optional)
- hit the spacebar or use a clicker like you would with a powerpoint
- run code at any point during the presentation

### Summary

Don't just teach your students programming, teach them the process of programming! By using Qodemate you get all the benefits of static slide based presentations and live coding presentations and none of the disadvantages! Still not convinced? Take a look at the simple_sample.js and lesson.md files bellow and see how easy it is to section out your code and write slides in markdown!

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
