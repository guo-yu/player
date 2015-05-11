var Player = require('../dist/player');
var pkg = require('../package.json');
var debug = require('debug')(pkg.name);

var player = new Player([
  __dirname + '/demo.mp3'
]);

player.play(function(err) {
  debug('all songs play end');
});

player.on('downloading', function(song) {
  debug('I\'m downloading... ');
  debug(song);
});

player.on('playing', function(song) {

  debug('I\'m playing... ');
  debug(song);
  debug('Add new song');

  if (song._id === 0)
    player.add('http://node-player.qiniudn.com/demo2.mp3');

  debug('Will switch to next song in 3s:');

  setTimeout(function(){
    debug('Switching...');

    player.next(function(err, song){
      if (!err)
        return debug('Switched !!');

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
