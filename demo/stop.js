var Player = require('../index');

var player = new Player([
  __dirname + '/demo.mp3',
  __dirname + '/demo2.mp3'
]);

player.play(function(err) {
  console.log('all songs play end');
});

player.on('playing', function(song) {
  console.log('im playing... ');
  console.log(song);
  console.log('and I\'ll stop in 5s:');
  setTimeout(function(){
    console.log('stopped now !');
    player.stop();
  }, 5000)
});

player.on('playend', function(song) {
  console.log('play done, switching to next one ...');
});

player.on('error', function(err) {
  console.log('Opps...!')
  console.log(err);
});