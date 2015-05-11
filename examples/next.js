var Player = require('../dist/player');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

var player = new Player([
  __dirname + '/demo.mp3',
  __dirname + '/demo2.mp3',
  __dirname + '/demo.mp3',
  __dirname + '/demo2.mp3',
  __dirname + '/demo.mp3',
  __dirname + '/demo2.mp3',
]);

player.play(function(err) {
  debug('all songs play end');
});

player.on('playing', function(song) {
  debug('im playing... ');
  debug(song);
  debug('and I\'ll switch to next song in 3s:');

  setTimeout(function(){
    debug('switch now !');

    player.next(function(err, song){
      if (!err) return debug('switched !!');
      return debug(err);
    });
  }, 3000);
});

player.on('playend', function(song) {
  debug('play done, switching to next one ...');
});

player.on('error', function(err) {
  debug('Opps...!')
  debug(err);
});
