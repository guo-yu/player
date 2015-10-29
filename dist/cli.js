'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _keypress = require('keypress');

var _keypress2 = _interopRequireDefault(_keypress);

var _distPlayer = require('../dist/player');

var _distPlayer2 = _interopRequireDefault(_distPlayer);

exports['default'] = function () {
  var command = process.argv[2];
  if (!command) return;

  var songs = process.argv.splice(3);
  if (!songs || songs.length === 0) return;

  var player = new _distPlayer2['default'](format(songs));

  try {
    player[command]();
  } catch (err) {
    console.log(err);
  }

  function format(songs) {
    return songs.map(function (songPath) {
      if (isAbs(songPath)) return songPath;

      return _path2['default'].join(process.cwd(), songPath);
    });
  }

  function isAbs(str) {
    if (str.indexOf('http') === 0 || str.indexOf('https') === 0) return true;

    var beginWith = str.charAt(0);
    if (beginWith === '~' || beginWith == '/') return true;

    return false;
  }

  var vol = 1;

  function updateVolume() {
    player.setVolume(vol);
    console.log('volume: ' + Math.floor(vol * 100));
  }

  _keypress2['default'](process.stdin);

  var paused = false;

  process.stdin.on('keypress', function (ch, key) {
    if (key && key.ctrl && key.name == 'c') {
      process.exit(0);
    }
    if (key && key.name == 'space') {
      player.pause();
      if (!paused) console.log('paused');else console.log('resuming');
      paused = !paused;
    }
    if (key && key.name == 'x') {
      player.stop();
      console.log('stopped');
    }
    if (key && key.name == 's') {
      player.play();
      console.log('playing');
    }
    if (key && key.name == 'up') {
      vol += 0.1;
      if (vol > 1) {
        vol = 1;
      }
      updateVolume();
    }
    if (key && key.name == 'down') {
      vol -= 0.1;
      if (vol < 0) {
        vol = 0;
      }
      updateVolume();
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();

  console.log('press "x" to stop, press "s" to play, press "space" to pause / resume');
  console.log('press "Up" to increase volume, press "Down" to decrease volume');
};

module.exports = exports['default'];
//# sourceMappingURL=cli.js.map