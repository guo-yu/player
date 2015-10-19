'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.fetchName = fetchName;
exports.format = format;
exports.chooseRandom = chooseRandom;
exports.getProgress = getProgress;
exports.splitName = splitName;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function fetchName(str) {
  var filename = str.substr(str.lastIndexOf('/') + 1);

  // Escape URI like this: `http://domain.com/xxx.mp3?xcode=fasda`
  if (filename.indexOf('?') !== -1) {
    var parts = filename.split('?');
    filename = parts[0];
  }

  return filename;
}

function format(list, srcKey) {
  var songs = [];

  if (typeof list === 'string') {
    var _songs$push;

    songs.push((_songs$push = {}, _defineProperty(_songs$push, srcKey, list), _defineProperty(_songs$push, '_id', 0), _defineProperty(_songs$push, '_name', splitName(list)), _songs$push));

    return songs;
  }

  list.forEach(function (item, index) {
    var _songs$push2;

    // If `songs` is a Map
    if (typeof item === 'object') {
      item._id = index;

      if (item[srcKey]) item._name = splitName(item[srcKey]);

      songs.push(item);
      return;
    }

    // If `songs` is a Array
    songs.push((_songs$push2 = {}, _defineProperty(_songs$push2, srcKey, item), _defineProperty(_songs$push2, '_id', index), _defineProperty(_songs$push2, '_name', splitName(item)), _songs$push2));
  });

  return songs;
}

function chooseRandom(arr) {
  if (!arr || !arr.length) return 0;

  var min = 0;
  var max = arr.length - 1;

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getProgress(p, t, info) {
  var bar = '';
  bar += 'Now playing: ' + info;
  bar += '\n[';

  for (var i = 0; i < p; i++) bar += '>';

  for (var i = p; i < t - 1; i++) bar += ' ';

  bar += ']';

  return bar;
}

function splitName(str) {
  return str.split('/').pop();
}
//# sourceMappingURL=utils.js.map