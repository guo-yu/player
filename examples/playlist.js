var path = require('path');
var Player = require('../dist/player');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

var songs = [
  path.join(__dirname, './mp3/demo.mp3'),
  path.join(__dirname, '/mp3/demo2.mp3')
]

new Player(songs)
  .on('playing', function(song) {
    debug('playlist', this.list)
  })
  .on('playend', function(song) {
    debug('Play List After Song Played')
  })
  .on('error', function(err) {
    debug('Opps...!')
    debug(err)
  })
  .play()
