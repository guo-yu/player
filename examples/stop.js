var path = require('path');
var Player = require('../dist/player');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

var songs = [
  path.join(__dirname, 'demo.mp3'),
  path.join(__dirname, 'demo2.mp3')
]

new Player(songs)
  play(function(err) {
    debug('all songs play end');
  })
  on('playing', function(song) {
    var player = this;

    debug('im playing... ');
    debug(song);
    debug('and I\'ll stop in 5s:');

    setTimeout(function(){
      debug('stopped now !');
      player.stop();
    }, 5000)
  })
  on('playend', function(song) {
    debug('play done, switching to next one ...');
  })
  on('error', function(err) {
    debug('Opps...!')
    debug(err);
  });
