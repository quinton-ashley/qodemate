# Qodemate

Qodemate is a dynamic, un-sandboxed CS presentation/textbook platform!
## Goals and Ethos
* Made for CS Educators, so that with minimal prep work they can give fancy, multi-file, non-sequential, step reproduction presentations (just like the ones on CodeAcademy and Hour of Code).
* The ethos of Qodemate is to make the process of coding transparent.
* Works with the fully featured IDEs you love (like Eclipse, Adobe Brackets, Xcode, etc.) and doesn't use a sandboxed webpage IDE.  Many sandboxed tutorial sites teach people the basics of programming well but they often have a lot of code running behind the scenes that users can't access.  Students that use sandboxed programming sites often don't know where to start when making their own projects offline.
* Run projects locally on the user's computer so they can see all the files and modules in their project.  In addition to code reproduction, during a Qodemate presentation you can pull up docs, install packages, run commands, and even do a search on StackOverflow.
* Students that use Qodemate get real world programming experience: how to get from nothing to something or using packages to create a project greater than the sum of its parts.  Qodemate was designed so that teachers can purposefully show all the trial and error along the way.  Don't just teach your students to code, teach them the process of programming!
## Why should I use Qodemate?
Most of my teachers in college used static screenshots of code on powerpoint slides.  That requires a lot of prep work and it's not as engaging for students because the program you've sliced into screenshots can't be run at different points during the lesson.  Other teachers I had would try to live code examples from memory and teach a class at the same time.  That takes a lot of effort and can be overwhelming to teachers and students.  It also restricts you to sitting behind a computer during class instead of interacting with students.  By using Qodemate you get all the benefits of both methods of teaching and none of the downsides!  Still not convinced?  Take a look at the simple_sample.js and lesson.md files bellow and see how easy it is to section off your code and write slides in markdown!
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
## How does it work?

## Getting Started
https://github.com/quinton-ashley/qodemate-test-files
## Future Goals
### Presentation Syncing to Student Computers
Another useful application of scripted presentation could be enabling students to run their teacher's presentation on their own computers during the lecture.  
### Video/Audio File Syncing
Steps can also be synced to video tutorials on Youtube, vimeo, etc outside a classroom setting to create interactive tutorial experiences outside the classroom.
