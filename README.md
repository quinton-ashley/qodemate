# Qodemate

Qodemate is a dynamic, un-sandboxed CS presentation/textbook platform!
## Goals and Ethos
* Made for CS Educators, so that with minimal prep work they can give fancy, multi-file, non-sequential, step reproduction presentations (just like the ones on CodeAcademy and Hour of Code).
* The ethos of Qodemate is to make the process of coding transparent.
* Works with the fully featured IDEs you love (like Eclipse, Adobe Brackets, Xcode, etc.) and doesn't use a sandboxed webpage IDE.  Many sandboxed tutorial sites teach people the basics of programming well but they often have a lot of code running behind the scenes that users can't access.  Students that use sandboxed programming sites often don't know where to start when making their own projects offline.
* Run projects locally on the user's computer so they can see all the files and modules in their project.  In addition to code reproduction, during a Qodemate presentation you can pull up docs, install packages, run commands, and even do a search on StackOverflow.
* Students that use Qodemate get real world programming experience: how to get from a blank document of nothing to something or using packages to build a project greater than the sum of its parts.  Qodemate was designed so that teachers can purposefully show all the trial and error along the way.  Don't just teach your students to code, teach them the process of programming!
## Why should I use Qodemate?
### Static Slide Presentations
* require a lot of prep work
* slides can only contain static screenshots or excerpts of code
* can't run the program at different points during the presentation
### Live Coding Presentations
*  must be done from memory or improvised
* teaching a class at the same time can be difficult
* forces you to sit/stand behind a computer during class
### Dynamic Qodemate Presentations
* prep every moment of a dynamic presentation
* run code at any point during the presentation
* no typing necessary, hit the spacebar or use a clicker like you would with a powerpoint
### Summary
By using Qodemate you get all the benefits of static slide based presentations and live coding presentations and none of the disadvantages!  Still not convinced?  Take a look at the simple_sample.js and lesson.md files bellow and see how easy it is to section your code and write slides in markdown!
## Simple Sample Project
```javascript
// simple_sample.js
function setup() { //0
  console.log('setting up...'); //2
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
## Installation
Gotta see it to believe it? ~~Click on the releases tab and download the native Qodemate app for your OS.~~  **Qodemate is currently pre-beta, you must clone this repository and build yourself**
```
$ mkdir ~/Documents/dev
$ cd ~/Documents/dev
$ git clone https://github.com/quinton-ashley/qodemate.git
$ cd qodemate
$ npm i
$ npm start
```
## How does it work?
...
## Getting Started
...  
https://github.com/quinton-ashley/qodemate-test-files
## Future Features
### Presentation Syncing to Student Computers
Another useful application of scripted presentation could be enabling students to run their teacher's presentation on their own computers during the lecture.  
### Video/Audio File Syncing
Steps can also be synced to video tutorials on Youtube, vimeo, etc outside a classroom setting to create interactive tutorial experiences outside the classroom.
