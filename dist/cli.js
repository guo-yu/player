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

  (0, _keypress2['default'])(process.stdin);

  process.stdin.on('keypress', function (ch, key) {
    if (key && key.ctrl && key.name == 'c') {
      process.exit(0);
    }
    if (key && key.name == 'space') {
      player.pause();
    }
    if (key && key.name == 'x') {
      player.stop();
    }
    if (key && key.name == 's') {
      player.play();
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();

  console.log('press "x" to stop, press "s" to play, press "space" to pause / resume');
};

module.exports = exports['default'];
//# sourceMappingURL=cli.js.map