'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x2,
    property = _x3,
    receiver = _x4; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

/**
*
* Command line interface mp3 player based on Node.js
* @Author:   [turingou](http://guoyu.me)
* @Created:  [2013/07/20]
*
**/

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _home = require('home');

var _home2 = _interopRequireDefault(_home);

var _lame = require('lame');

var _lame2 = _interopRequireDefault(_lame);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _speaker = require('speaker');

var _speaker2 = _interopRequireDefault(_speaker);

var _pool_stream = require('pool_stream');

var _pool_stream2 = _interopRequireDefault(_pool_stream);

var _events = require('events');

var _utils = require('./utils');

var defaults = {
  'src': 'src',
  'cache': false,
  'stream': false,
  'shuffle': false,
  'downloads': _home2['default'](),
  'http_proxy': process.env.HTTP_PROXY || process.env.http_proxy || null };

/**
 * [Class Player]
 * @param {Array|String} songs  [A list of songs or a single song URI string.]
 * @param {Object}       params [Optional options when init a instance]
 */

var Player = (function (_EventEmitter) {
  function Player(songs, params) {
    _classCallCheck(this, Player);

    if (!songs) return;

    // Inherits eventEmitter
    _get(Object.getPrototypeOf(Player.prototype), 'constructor', this).call(this);

    this.history = [];
    this.options = _underscore2['default'].extend(defaults, params);
    this._list = _utils.format(songs, this.options.src);
  }

  _inherits(Player, _EventEmitter);

  _createClass(Player, [{
    key: 'enable',

    // Enable or disable a option
    value: function enable(k) {
      this.options[k] = true;
      return this;
    }
  }, {
    key: 'disable',
    value: function disable(k) {
      this.options[k] = false;
      return this;
    }
  }, {
    key: 'list',

    /**
     * [Lists songs in the playlist,
     * Displays the src for each song returned in array,
     * Access with prop `player.list`]
     */
    get: function () {
      var _this2 = this;

      if (!this._list) return;

      return this._list.map(function (el) {
        return el[_this2.options.src];
      });
    }
  }, {
    key: 'playing',

    // Get the lastest playing song
    get: function () {
      if (!this.history.length) return null;

      return this._list[this.history[this.history.length - 1]];
    }
  }, {
    key: 'play',

    /**
     * [Play a MP3 encoded audio file]
     * @param  {Number} index [the selected index of first played song]
     */
    value: function play() {
      var _this3 = this;

      var index = arguments[0] === undefined ? 0 : arguments[0];

      if (this._list.length <= 0) return;
      if (!_underscore2['default'].isNumber(index)) index = 0;

      var self = this;
      var song = this._list[index];

      this.read(song[this.options.src], function (err, pool) {
        if (err) return _this3.emit('error', err);

        _this3.meta(pool, function (err, data) {
          if (!err) song.meta = data;
        });

        pool.pipe(new _lame2['default'].Decoder()).once('format', onPlaying).once('finish', function () {
          return _this3.next();
        });

        function onPlaying(f) {
          var speaker = new _speaker2['default'](f);

          self.speaker = {
            'readableStream': this,
            'Speaker': speaker };

          self.emit('playing', song);
          self.history.push(index);

          // This is where the song acturaly played end,
          // can't trigger playend event here cause
          // unpipe will fire this speaker's close event.
          this.pipe(speaker).once('close', function () {
            return self.emit('playend', song);
          });
        }
      });

      return this;
    }
  }, {
    key: 'read',

    /**
     * [Read MP3 src and check if we're going to download it.]
     * @param  {String}   src      [MP3 file src, would be local path or URI (http/https)]
     * @param  {Function} callback [callback with err and file stream]
     */
    value: function read(src, callback) {
      var isLocal = !(src.indexOf('http') == 0 || src.indexOf('https') == 0);

      // Read local file stream if not a valid URI
      if (isLocal) return callback(null, _fs2['default'].createReadStream(src));

      var file = _path2['default'].join(this.options.downloads, _utils.fetchName(src));

      if (_fs2['default'].existsSync(file)) return callback(null, _fs2['default'].createReadStream(file));

      this.download(src, callback);
    }
  }, {
    key: 'stop',

    /**
     * [Stop playing and unpipe stream.
     * No params for now.]
     * @return {Bool} [always `false`]
     */
    value: function stop() {
      if (!this.speaker) return;

      this.speaker.readableStream.unpipe();

      this.speaker.Speaker.end();

      return;
    }
  }, {
    key: 'next',

    /**
     * [Stop playing and switch to next song,
     * if there is no next song, trigger a `No next song` error event]
     * @return {player} this
     */
    value: function next() {
      var list = this._list;
      var current = this.playing;
      var nextIndex = this.options.shuffle ? _utils.chooseRandom(_underscore2['default'].difference(list, [current._id])) : current._id + 1;

      if (nextIndex >= list.length) {
        this.emit('error', 'No next song was found');
        this.emit('finish', current);
        return this;
      }

      this.stop();
      this.play(nextIndex);

      return this;
    }
  }, {
    key: 'add',

    /**
     * [Add a new song to the playlist,
     * If provided `song` is a String, it will be converted to a `Song` Object.]
     * @param {String|Object} song [src URI of new song or the object of new song.]
     */
    value: function add(song) {
      var latest = _underscore2['default'].isObject(song) ? song : {};

      latest._id = this._list.length;

      if (_underscore2['default'].isString(song)) {
        latest._name = _utils.splitName(song);
        latest[this.options.src] = song;
      }

      this._list.push(latest);
    }
  }, {
    key: 'download',

    /**
     * [Download a mp3 file from its URI]
     * @param  {String}   src      [the src URI of mp3 file]
     * @param  {Function} callback [callback with err and file stream]
     */
    value: function download(src, callback) {
      var self = this;
      var called = false;
      var proxyReg = /http:\/\/((?:\d{1,3}\.){3}\d{1,3}):(\d+)/;
      var http_proxy = self.options.http_proxy;
      var request = src.indexOf('https') === 0 ? _https2['default'] : _http2['default'];
      var query = src;

      if (http_proxy && proxyReg.test(http_proxy)) {
        var proxyGroup = http_proxy.match(proxyReg);
        query = {};
        query.path = src;
        query.host = proxyGroup[1];
        query.port = proxyGroup[2];
      }

      request.get(query, responseHandler).once('error', errorHandler);

      function responseHandler(res) {
        called = true;

        var isOk = res.statusCode === 200;
        var isAudio = res.headers['content-type'].indexOf('audio/mpeg') > -1;
        var isSave = self.options.cache;
        var isStream = self.options.stream;

        if (!isOk) return callback(new Error('Resource invalid'));
        if (isStream) return callback(null, res);
        if (!isAudio) return callback(new Error('Resource type is unsupported'));

        // Create a pool
        var pool = new _pool_stream2['default']();
        // Pipe into memory
        res.pipe(pool);

        // Check if we're going to save this stream
        if (!isSave) return callback(null, pool);

        // Save this stream as file in download directory
        var file = _path2['default'].join(self.options.downloads, _utils.fetchName(src));

        self.emit('downloading', src);
        pool.pipe(_fs2['default'].createWriteStream(file));

        // Callback the pool
        callback(null, pool);
      }

      function errorHandler(err) {
        if (!called) callback(err);
      }
    }
  }, {
    key: 'meta',

    // Fetch metadata from local or remote mp3 stream
    value: function meta(stream, callback) {
      var _this4 = this;

      try {
        var mm = require('musicmetadata');
      } catch (err) {
        return callback(err);
      }

      var options = {
        'duration': true
      };

      stream.on('error', function (err) {
        return _this4.emit('error', '出错了 ' + err.code + ': ' + err.path);
      });

      return mm(stream, options, callback);
    }
  }, {
    key: 'progress',

    // Format metadata with template
    // And output to `stdout`
    value: function progress(metadata) {
      var total = 70;
      var info = metadata.title;
      var duration = parseInt(metadata.duration);
      var dots = total - 1;
      var speed = duration * 1000 / total;
      var stdout = process.stdout;

      require('async').doWhilst(function (callback) {
        // Clear console
        stdout.write('\u001b[2J\u001b[0;0f');

        // Move cursor to beginning of line
        stdout.cursorTo(0);
        stdout.write(_utils.getProgress(total - dots, total, info));

        setTimeout(callback, speed);

        dots--;
      }, function () {
        return dots > 0;
      }, function (done) {
        stdout.moveCursor(0, -1);
        stdout.clearLine();
        stdout.cursorTo(0);
      });
    }
  }]);

  return Player;
})(_events.EventEmitter);

exports['default'] = Player;
module.exports = exports['default'];
//# sourceMappingURL=player.js.map