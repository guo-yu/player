var path = require('path');
var Player = require('../dist/player');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

var songs = [
  path.join(__dirname, './mp3/demo.mp3')
]

new Player(songs)
  .on('downloading', function(song) {
    debug('I\'m downloading... ');
    debug(song);
  })
  .on('playing', function(song) {
    var player = this
    debug('I\'m playing... ');
    debug(song);
    debug('Add new song');

    if (song._id === 0)
      player.add('http://node-player.qiniudn.com/demo2.mp3');

    debug('Will switch to next song in 3s:')

    setTimeout(function(){
      player.next()
    }, 3000)
  })
  .on('playend', function(song) {
    debug('play done, switching to next one ...')
  })
  .on('error', function(err) {
    debug('Opps...!')
    debug(err)
  })
  .play()
