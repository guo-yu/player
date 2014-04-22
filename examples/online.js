var Player = require('../index');

var player = new Player([
  'http://node-player.qiniudn.com/demo.mp3',
  'http://node-player.qiniudn.com/demo2.mp3'
]);

player.play(function(err) {
  console.log('all songs play end');
});

player.on('downloading', function(song) {
  console.log('im downloading... ');
  console.log(song);
});

player.on('playing', function(song) {
  console.log('im playing... ');
  console.log(song);
});

player.on('playend', function(song) {
  console.log('play done, switching to next one ...');
});

player.on('error', function(err) {
  console.log('Opps...!')
  console.log(err);
});