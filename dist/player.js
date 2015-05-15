'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

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
    this._list = _utils.format(songs);
    this.options = _underscore2['default'].extend(defaults, params);
  }

  _inherits(Player, _EventEmitter);

  _createClass(Player, [{
    key: 'list',

    /**
     * [Lists songs in the playlist,
     * Displays the src for each song returned in JSON,
     * Access with prop `player.list`]
     */
    get: function () {
      if (!this._list) return;

      return JSON.stringify(this._list.map(function (el) {
        return el.src;
      }));
    }
  }, {
    key: 'play',

    /**
     * [Play a mp3 list]
     * @param  {Function}      done     [the callback function when all mp3s play end]
     * @param  {Array[Object]} selected [the selected mp3 object.]
     */
    value: function play(done, selected) {
      var _this2 = this;

      var self = this;

      if (done !== 'next') this.once('done', _underscore2['default'].isFunction(done) ? done : errHandler);

      if (this._list.length <= 0) return;

      _async2['default'].eachSeries(selected || this._list, startPlay, function (err) {
        return _this2.emit('done', err);
      });

      return this;

      function startPlay(song, callback) {
        self.read(song[self.options.src], onPlay);

        function onPlay(err, pool) {
          if (err) return callback(err);

          self.meta(pool, function (err, data) {
            if (!err) song.meta = data;
          });

          pool.pipe(new _lame2['default'].Decoder()).once('format', onPlaying).once('finish', onFinished);

          function onPlaying(f) {
            var speaker = new _speaker2['default'](f);

            self.speaker = {
              'readableStream': this,
              'Speaker': speaker };

            self.emit('playing', song);
            self.history.push(song);

            // This is where the song acturaly played end,
            // can't trigger playend event here cause
            // unpipe will fire this speaker's close event.
            this.pipe(speaker).once('close', function () {
              return self.emit('stopped', song);
            });
          }

          function onFinished() {
            self.list = self.list.filter(function (item) {
              return item._id != song._id;
            });
            self.emit('playend', song);

            // Switch to next one
            callback(null);
          }
        }
      }

      function errHandler(err) {
        if (err) throw err;

        return;
      }
    }
  }, {
    key: 'read',

    /**
     * [Read mp3 src and check if we're going to download it.]
     * @param  {String}   src    [mp3 file src, would be local path or URI (http/https)]
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
     * if there is no next song, callback with a `No next` Error object.]
     * @param  {Function} callback [callback with err and next song.]
     * @return {Bool}
     */
    value: function next(callback) {
      var list = this._list;
      var current = this.history[this.history.length - 1];
      var next = list[current._id + 1];
      var isCallback = callback && _underscore2['default'].isFunction(callback);

      if (!next) {
        if (isCallback) return callback(new Error('No next'));

        return;
      }

      this.stop();
      this.play('next', list.slice(next._id));

      return isCallback ? callback(null, next, current) : true;
    }
  }, {
    key: 'add',

    /**
     * [Add a new song to the playlist,
     * If provided `song` is a String, it will be converted to a `Song` Object.]
     * @param {String|Object} song [src URI of new song or the object of new song.]
     */
    value: function add(song) {
      if (!this._list) this._list = [];

      var latest = _underscore2['default'].isObject(song) ? song : {};

      latest._id = this._list.length;

      if (_underscore2['default'].isString(song)) latest.src = song;

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
      try {
        var mm = require('musicmetadata');
      } catch (err) {
        return callback(err);
      }

      var options = {
        'duration': true
      };

      stream.on('error', function (err) {
        console.log(new Error('出错了 ' + err.code + ': ' + err.path));
      });

      return mm(stream, options, callback);
    }
  }, {
    key: 'show',

    // Format metadata with template
    // And output to `stdout`
    value: function show(metadata) {
      var total = 70;
      var info = metadata.title;
      var duration = parseInt(metadata.duration);
      var dots = total - 1;
      var speed = duration * 1000 / total;

      _async2['default'].doWhilst(function (callback) {
        // Doesn't work sometimes on mac
        // process.stdout.clearLine()

        // Clear console
        process.stdout.write('\u0000o33c');

        // Move cursor to beginning of line
        process.stdout.cursorTo(0);
        process.stdout.write(_utils.getProgress(total - dots, total, info));

        setTimeout(callback, speed);

        dots--;
      }, function () {
        return dots > 0;
      }, function (done) {
        process.stdout.moveCursor(0, -1);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
      });
    }
  }]);

  return Player;
})(_events.EventEmitter);

exports['default'] = Player;
module.exports = exports['default'];
//# sourceMappingURL=player.js.map