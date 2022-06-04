const fpsSync = require('./index');

const game = fpsSync(60);

game.update(({seconds}) => {
  if(seconds > 2){
    console.log('last update')
    return true;
  }
  console.log('update');
});

game.draw(() => {
  console.log('draw');
});

game.start();

setTimeout(function(){
  console.log('Stopping Game...');
  game.stop(() => {
    console.log('Game Stopped!');
  });
}, 3000);
