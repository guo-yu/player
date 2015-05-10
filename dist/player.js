'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _speaker = require('speaker');

var _speaker2 = _interopRequireDefault(_speaker);

var _pool_stream = require('pool_stream');

var _pool_stream2 = _interopRequireDefault(_pool_stream);

var _musicmetadata = require('musicmetadata');

var _musicmetadata2 = _interopRequireDefault(_musicmetadata);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

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

var Player = (function () {
  function Player(songs, params) {
    var _this = this;

    _classCallCheck(this, Player);

    if (!songs) return;

    this.list = _utils2['default'].format(songs);
    this.history = [];
    this.options = _underscore2['default'].extend(defaults, params);

    // Bind events
    this.once('playing', function (song) {
      _this.playing = song;
      _this.history.push(song);
    });

    _events2['default'].EventEmitter.call(this);
  }

  _createClass(Player, [{
    key: 'play',

    /**
     * [Play a mp3 list]
     * @param  {Function} done     [the callback function when all mp3s play end]
     * @param  {[type]}   selected [the selected mp3 object.]
     */
    value: function play(done, selected) {
      var _this2 = this;

      var self = this;

      if (done !== 'next') this.once('done', _underscore2['default'].isFunction(done) ? done : errHandler);

      if (this.list.length <= 0) return;

      _async2['default'].eachSeries(selected || this.list, startPlay, function (err) {
        return _this2.emit('done', err);
      });

      function startPlay(song, callback) {
        var url = _underscore2['default'].isString(song) ? song : song[self.options.src];

        self.read(url, onPlay);

        function onPlay(err, pool) {
          if (err) return callback(err);

          pool.pipe(new _lame2['default'].Decoder()).once('format', onPlaying).once('finish', onFinished);

          function onPlaying(f) {
            var speaker = new _speaker2['default'](f);

            self.speaker = {};
            self.speaker.readableStream = this;
            self.speaker.Speaker = speaker;
            self.emit('playing', song);

            self.show(song);

            // This is where the song acturaly played end,
            // can't trigger playend event here cause
            // unpipe will fire this speaker's close event.
            this.pipe(speaker).once('close', function () {
              return self.emit('stopped', song);
            });
          }

          function onFinished() {
            self.list = self.list.filter(function (i) {
              return i['_id'] != song._id;
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

      var file = _path2['default'].join(this.options.downloads, _utils2['default'].fetchName(src));

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
      var list = this.list;
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
      if (!this.list) this.list = [];

      var latest = _underscore2['default'].isObject(song) ? song : {};

      latest._id = this.list.length;

      if (_underscore2['default'].isString(song)) latest.src = song;

      this.list.push(latest);
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
        var file = _path2['default'].join(self.options.downloads, _utils2['default'].fetchName(src));

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
    key: 'playList',

    /**
     * [Lists songs in the playlist,
     * Displays the src for each song returned in JSON]
     */
    value: function playList() {
      if (!this.list) return;

      return JSON.stringify(this.list.map(function (el) {
        return el['src'];
      }));
    }
  }, {
    key: 'show',
    value: function show(song) {
      var total = 70;
      var name = song['src'].split('/').pop();
      var options = {
        'duration': true
      };

      var parser = _musicmetadata2['default'](_fs2['default'].createReadStream(name), options, function (err, metadata) {
        if (err) {
          console.log('Now playing: ' + name + ' (No metadata found)');
          return;
        }

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
          process.stdout.write(_utils2['default'].getProgress(total - dots, total, info));

          setTimeout(callback, speed);

          dots--;
        }, function () {
          return dots > 0;
        }, function (done) {
          process.stdout.moveCursor(0, -1);
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
        });
      });
    }
  }]);

  return Player;
})();

exports['default'] = Player;

_util2['default'].inherits(Player, _events2['default'].EventEmitter);
module.exports = exports['default'];
//# sourceMappingURL=player.js.map