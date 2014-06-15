var Player = require('../index');

var player = new Player([
  __dirname + '/demo.mp3',
  __dirname + '/demo2.mp3'
]);

console.log("Play List:" + player.playList());

player.play(function(err) {
  console.log('all songs play end');
  console.log("Play List End:" + player.playList());
});

player.on('playend', function(song) {
  console.log("Play List After Song Played:" + player.playList());
});

player.on('error', function(err) {
  console.log('Opps...!')
  console.log(err);
});
