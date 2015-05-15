var path = require('path');
var Player = require('../dist/player');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

new Player(path.join(__dirname, './mp3/demo3_with_metadata.mp3'))
  .on('playing', function(song) {
    debug('Playing... ')
    debug(song.meta)

    // Show formated metadata to `stdout`
    if (song.meta)
      this.progress(song.meta)
  })
  .on('error', function(err) {
    debug('Opps...!')
    debug(err)
  })
  .play()
