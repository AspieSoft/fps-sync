;const fpsSync = (function () {
  if (typeof requestAnimationFrame === 'undefined') {
    var requestAnimationFrame = function (cb) {
      setImmediate(() => cb(Date.now()));
    };
  }

  function run(FPS = 60, start = Date.now(), running = false) {
    // round the FPS to a whole number
    FPS = Math.round(FPS);
    if (FPS < 1) {
      // ensure FPS is greater than 1
      // 0 FPS means no frames will run
      FPS = 1;
      console.warn('set to minimum fps: 1');
    } else if (FPS > 10000) {
      // cap FPS at 10000
      // this is the maximum the system can stabally handle
      // anything higher is ridiculous anyway
      FPS = 10000;
      console.warn('set to maximum fps: 10000');
    }

    const updateList = [];
    const drawList = [];

    let seconds = 0;
    let frames = 0;

    // the real number of frames that will run within a second
    const rFPS = 1000 / FPS;

    // can be multiplied to a number, to make intervals consistant at different FPS values
    const delta = 60 / FPS;

    let stopCB = undefined;

    let last = 0;
    let hasUpdate = false;
    function runUpdate(now) {
      (function () {
        let time = now - start - rFPS * (seconds * FPS);

        // when a second has passed
        if (time > 1000) {
          // ensure all logic updates happened
          while (frames < FPS) {
            frames++;
            let changed = update(frames, FPS, delta, seconds, Date.now() - now, time, FPS - frames);
            if(changed){
              hasUpdate = true;
            }
          }

          seconds++;
          frames = 0;
          for(let i = 0; i < updateList.length; i++){
            updateList[i].frames = 0;
          }
          return;
        }

        // run update if we should
        // "frames < FPS" prevents us from running to many frames
        // "time/rFPS > frames" prevents us from running frames too fast, but also allows extra frames if running too slow
        if (frames < FPS && time / rFPS > frames) {
          frames++;
          let changed = update(frames, FPS, delta, seconds, Date.now() - now, time);
          if(changed){
            hasUpdate = true;
          }
        }
      })();

      let newNow = Date.now();
      let elapsed = newNow - last;
      if (elapsed > rFPS) {
        last = now;

        // only run draw updates, if there is something new to draw
        if(hasUpdate){
          hasUpdate = false;
          draw(frames, FPS, seconds, newNow - now, elapsed);
        }
      }

      if(running){
        requestAnimationFrame(runUpdate);
      }else if(typeof stopCB === 'function'){
        stopCB(newNow, seconds);
        stopCB = undefined;
      }
    }
    if(running){
      requestAnimationFrame(runUpdate);
    }

    function update(frames, fps, delta, seconds, lag, elapsed, updateCount) {
      const del = [];
      let changed = false;

      for (let i = 0; i < updateList.length; i++) {
        if (updateList[i].fps) {
          if (updateList[i].frames < updateList[i].fps) {
            let d = 60 / updateList[i].fps;
            let inc = 1;
            if(updateList[i].merge){
              d *= updateCount;
              inc = updateCount;
            }
            if (frames % Math.round(fps / updateList[i].fps) === 0) {
              updateList[i].frames += inc;
              let stop = updateList[i].cb({ frames: updateList[i].frames, fps: updateList[i].fps, delta: d, seconds, lag, elapsed }, { frames, fps, delta, seconds, lag, elapsed });
              if(stop === true){
                del.push(i);
              }else if(stop !== false){
                changed = true;
              }
            }
            if (frames === fps) {
              while (updateList[i].frames > updateList[i].fps) {
                updateList[i].frames += inc;
                let stop = updateList[i].cb({ frames: updateList[i].frames, fps: updateList[i].fps, delta: d, seconds, lag, elapsed }, { frames, fps, delta, seconds, lag, elapsed });
                if(stop === true){
                  del.push(i);
                }else if(stop !== false){
                  changed = true;
                }
              }
            }
          }
        } else if(updateList[i].frames < fps) {
          let d = delta;
          let inc = 1;
          if(updateList[i].merge){
            d *= updateCount;
            inc = updateCount;
          }
          updateList[i].frames += inc;
          let stop = updateList[i].cb({ frames: updateList[i].frames, fps, delta: d, seconds, lag, elapsed }, { frames, fps, delta, seconds, lag, elapsed });
          if(stop === true){
            del.push(i);
          }else if(stop !== false){
            changed = true;
          }
        }
      }

      for(let i = del.length-1; i >= 0; i--){
        updateList.splice(del[i], 1);
      }

      return changed;
    }

    function draw(frames, fps, seconds, lag, elapsed) {
      const del = [];

      for (let i = 0; i < drawList.length; i++) {
        let stop = drawList[i]({ frames, fps, seconds, lag, elapsed });
        if(stop === true){
          del.push(i);
        }
      }

      for(let i = del.length-1; i >= 0; i--){
        drawList.splice(del[i], 1);
      }
    }

    return {
      start: function(setStart, setSeconds){
        setStart = Number(setStart);
        setSeconds = Number(setSeconds);
        if(setStart){
          start = setStart;
        }
        if(setSeconds){
          seconds = setSeconds;
        }
        running = true;
        requestAnimationFrame(runUpdate);
      },
      stop: function(cb){
        stopCB = cb;
        running = false;
      },
      update: function (fps, merge, cb) {
        if(typeof fps === 'function'){
          [fps, cb] = [cb, fps];
        }else if(typeof merge === 'function'){
          [merge, cb] = [cb, merge];
        }
        if(typeof fps === 'boolean'){
          [fps, merge] = [merge, fps];
        }

        if(typeof cb !== 'function'){
          return;
        }

        fps = Number(fps);
        if (!fps) {fps = undefined;}
        merge = !!merge;

        updateList.push({ fps, frames: 0, cb, merge });
      },
      draw: function (cb) {
        if (typeof cb !== 'function') {
          return;
        }
        drawList.push(cb);
      },
    };
  }

  return run;
})();

if(typeof module !== 'undefined'){
  module.exports = fpsSync;
}else if(typeof window !== 'undefined'){
  window.fpsSync = fpsSync;
}else if(typeof global !== 'undefined'){
  global.fpsSync = fpsSync;
}
