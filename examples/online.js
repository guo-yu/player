var Player = require('../dist/player');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

var songs = [
  'http://node-player.qiniudn.com/demo.mp3',
  'http://node-player.qiniudn.com/demo2.mp3'
]

new Player(songs)
  .on('downloading', function(song) {
    debug('im downloading... ');
    debug(song);
  })
  .on('playing', function(song) {
    debug('im playing... ');
    debug(song);
  })
  .on('playend', function(song) {
    debug('play done, switching to next one ...');
  })
  .on('error', function(err) {
    debug('Opps...!')
    debug(err);
  })
  .play()
