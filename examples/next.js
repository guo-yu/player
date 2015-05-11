var path = require('path');
var Player = require('../dist/player');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

var songs = [
  path.join(__dirname, './mp3/demo.mp3'),
  path.join(__dirname, './mp3/demo2.mp3'),
  path.join(__dirname, './mp3/demo.mp3'),
  path.join(__dirname, './mp3/demo2.mp3'),
  path.join(__dirname, './mp3/demo.mp3'),
  path.join(__dirname, './mp3/demo2.mp3')
]

new Player(songs)
  .play(function(err) {
    debug('all songs play end');
  })
  .on('playing', function(song) {
    var player = this;

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
  })
  .on('playend', function(song) {
    debug('play done, switching to next one ...');
  })
  .on('error', function(err) {
    debug('Opps...!')
    debug(err);
  })
