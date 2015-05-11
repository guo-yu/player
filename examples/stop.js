var Player = require('../dist/player');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

var player = new Player([
  __dirname + '/demo.mp3',
  __dirname + '/demo2.mp3'
]);

player.play(function(err) {
  debug('all songs play end');
});

player.on('playing', function(song) {
  debug('im playing... ');
  debug(song);
  debug('and I\'ll stop in 5s:');

  setTimeout(function(){
    debug('stopped now !');
    player.stop();
  }, 5000)
});

player.on('playend', function(song) {
  debug('play done, switching to next one ...');
});

player.on('error', function(err) {
  debug('Opps...!')
  debug(err);
});
