var Player = require('../index');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

var player = new Player([
  'http://node-player.qiniudn.com/demo.mp3',
  'http://node-player.qiniudn.com/demo2.mp3'
]);

player.play(function(err) {
  debug('all songs play end');
});

player.on('downloading', function(song) {
  debug('im downloading... ');
  debug(song);
});

player.on('playing', function(song) {
  debug('im playing... ');
  debug(song);
});

player.on('playend', function(song) {
  debug('play done, switching to next one ...');
});

player.on('error', function(err) {
  debug('Opps...!')
  debug(err);
});
