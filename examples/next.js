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
  console.log('and I\'ll switch to next song in 3s:');
  setTimeout(function(){
    console.log('switch now !');
    player.next(function(err, song){
      if (!err) return console.log('switched !!');
      return console.log(err);
    });
  }, 3000);
});

player.on('playend', function(song) {
  console.log('play done, switching to next one ...');
});

player.on('error', function(err) {
  console.log('Opps...!')
  console.log(err);
});