# FPS Sync

![npm version](https://img.shields.io/npm/v/fps-sync)
![gitHub top language](https://img.shields.io/github/languages/top/aspiesoft/fps-sync)
![npm license](https://img.shields.io/npm/l/fps-sync)

![npm weekly downloads](https://img.shields.io/npm/dw/fps-sync)
![npm monthly downloads](https://img.shields.io/npm/dm/fps-sync)

[![donation link](https://img.shields.io/badge/buy%20me%20a%20coffee-square-blue)](https://buymeacoffee.aspiesoft.com)

A time based update loop which can synchronize the FPS and frame count of 2 animations.

You can also use this to synchronize an animation between the server and the client.

## Installation

```shell script
npm install fps-sync
```

```html
<script src="https://cdn.jsdelivr.net/gh/AspieSoft/fps-sync@1.3.2/index.js"></script>
```

## Setup

```js

const fpsSync = require('fps-sync');

const game = fpsSync(60 /* FPS */, Date.now() /* Start Time */);

game.update((info) => {
  console.log('update logic and math');
});

game.draw((info) => {
  console.log('draw an image on the canvas');
});

game.start();

game.stop(() => {
  console.log('game stopped');
});

// the pause method will pause the game without stopping the loop, and will not try to resyncronize the time and catch up on updates when resumed
// notice: this method does Not synchronize updates with other instances, and is here in case anyone wants to use this module for a simple singleplayer instance
// you can run the start method to unpause the update loop
game.pause();

```

## Usage

```js

// update and draw info
game.update(30 /* set a custom FPS for a specific update */, ({
  frames, // the number of frames run
  fps, // the total fps
  delta, // a number you can multiply by an interval, to maintain consistant results at a different FPS
  seconds, // the number of seconds since starting (note: stop is more of a pause)
  lag, // the amount of time between when the frame was called, and when this specific update was called
  elapsed, // the amount of time between this update, and the last one
}) => {
  
});

game.update(30, (infoForThisUpdate, generalInfoForAllUpdates) => {
  // the info for this update and general info for all updates have the same object structure
  // infoForThisUpdate will recalculate based on the modified FPS
  // generalInfoForAllUpdates uses the default FPS calculations
});

game.draw(({
  frames, // the number of frames that should have passed
  fps, // the default fps
  seconds, // the number of seconds since starting (note: stop is more of a pause)
  lag, // the amount of time between when the frame was called, and this function was called (tells you how long logic updates took)
  elapsed, // the amount of time between this update, and the last one
  }) => {

});


// how to stop update and draw functions
game.update(() => {
  if(done){
    // remove this function from the update list
    return true;
  }
});

game.draw(() => {
  if(done){
    // remove this function from the draw list
    return true;
  }
});

game.update(() => {
  if(nothingChanged){
    // if every update returns false, the draw functions will not run
    // you can do this if there is nothing new to draw from this function
    return false;
  }
});


// merging lagging updates
game.update(true, ({delta}) => {
  // if true is passed as an arg, it means you are setting merge mode to true
  // by default, when updates lag behind, they are all run multiple times without a pause
  // when merge is true, only one update occurs and the delta value is multiplied instead
  value += 1 * delta;
});

```
