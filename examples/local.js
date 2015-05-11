var Player = require('../dist/player');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

var player = new Player([
  __dirname + '/demo.mp3',
  __dirname + '/demo2.mp3'
]);

player.play(function(err) {
  debug('All songs play end');
});

player.on('playing', function(song) {
  debug('I\'m playing... ');
  debug(song);
});

player.on('playend', function(song) {
  debug('Play done, Switching to next one ...');
});

player.on('error', function(err) {
  debug('Opps...!')
  debug(err);
});
