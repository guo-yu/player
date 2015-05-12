'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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
};

module.exports = exports['default'];
//# sourceMappingURL=cli.js.map