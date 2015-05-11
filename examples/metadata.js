var path = require('path');
var Player = require('../dist/player');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

new Player(path.join(__dirname, 'demo3_with_metadata.mp3'))
  .on('playing', function(song) {
    debug('Playing... ');
    debug(song.meta);
  })
  .on('error', function(err) {
    debug('Opps...!')
    debug(err);
  })
  .play()
