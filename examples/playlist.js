var Player = require('../index');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

var player = new Player([
  __dirname + 'Breeze.mp3',
  __dirname + 'Breeze.mp3'
]);

debug("Play List:" + player.playList());

player.play(function(err) {
  debug('all songs play end');
  debug("Play List End:" + player.playList());
});

player.on('playend', function(song) {
  debug("Play List After Song Played:" + player.playList());
});

player.on('error', function(err) {
  debug('Opps...!')
  debug(err);
});
