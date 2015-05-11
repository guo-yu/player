var Player = require('../dist/player');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

var player = new Player('http://stream.srg-ssr.ch/m/rsp/mp3_128', {
  stream: true
});

player.play();

player.on('playing', function(song) {
  debug('Playing... ');
  debug(song);
});

player.on('error', function(err) {
  debug('Opps...!')
  debug(err);
});
