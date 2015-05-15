var Player = require('../dist/player');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

new Player('http://stream.srg-ssr.ch/m/rsp/mp3_128')
  .enable('stream')
  .on('playing', function(song) {
    debug('Playing... ');
    debug(song);
  })
  .on('error', function(err) {
    debug('Opps...!')
    debug(err);
  })
  .play()
