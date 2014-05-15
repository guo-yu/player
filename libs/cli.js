var path = require('path');
var Player = require('../index');

module.exports = function() {
  var command = process.argv[2];
  if (!command) return false;
  var songs = process.argv.splice(3);
  if (!songs || songs.length === 0) return false;
  var player = new Player(format(songs));
  try {
    player[command]();
  } catch (err) {
    console.log(err);
  }
  return;
}

function format(songs) {
  var dir = process.cwd();
  return songs.map(function(song){
    return path.join(dir, song);
  });
}