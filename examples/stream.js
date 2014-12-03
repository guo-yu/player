var Player = require('../index');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

var player = new Player('http://stream.srg-ssr.ch/m/rsp/mp3_128', {
  stream: true
});

player.play(function(err) {
  debug('All songs play end');
});

player.on('playing', function(song) {
  debug('Playing... ');
  debug(song);
});

player.on('playend', function(song) {
  debug('Playend');
});

player.on('error', function(err) {
  debug('Opps...!')
  debug(err);
});
