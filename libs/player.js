var fs = require('fs');
var path = require('path');
var util = require("util");
var http = require('http');
var https = require('https');
var home = require('home');
var lame = require('lame');
var async = require('async');
var events = require("events");
var _ = require('underscore');
var Speaker = require('speaker');
var PoolStream = require('pool_stream');
var utils = require('./utils');

var defaults = {
  src: 'src',
  cache: false,
  stream: false,
  downloads: home(),
  http_proxy: process.env.HTTP_PROXY || process.env.http_proxy || null
};

module.exports = Player;

function errHandler(err) {
  if (err) throw err;
  return false;
}

/**
 * [Class Player]
 * @param {Array|String} songs  [may be a list of songs or a single song URI string.]
 * @param {Object}       params [optional options when init a instance]
 */
function Player(songs, params) {
  if (!songs)
    return false;

  this.list = utils.format(songs);
  this.history = [];
  this.options = _.extend(defaults, params);
  this.bindEvents();

  events.EventEmitter.call(this);
};

util.inherits(Player, events.EventEmitter);

Player.prototype.play = play;
Player.prototype.read = read;
Player.prototype.stop = stop;
Player.prototype.next = next;
Player.prototype.add = addSong;
Player.prototype.download = download;
Player.prototype.playList = playList;
Player.prototype.bindEvents = bindEvents;

/**
 * [Play a mp3 list]
 * @param  {Function} done     [the callback function when all mp3s play end]
 * @param  {[type]}   selected [the selected mp3 object.]
 */
function play(done, selected) {
  var self = this;

  if (done !== 'next')
    this.on('done', _.isFunction(done) ? done : errHandler);

  if (this.list.length <= 0)
    return false;

  async.eachSeries(selected || this.list, play, function(err) {
    self.emit('done', err);
  });

  function play(song, callback) {
    var url = _.isString(song) ?
        song :
        song[self.options.src];

    self.read(url, onPlay);

    function onPlay(err, pool) {
      if (err)
        return callback(err);

      pool
        .pipe(new lame.Decoder())
        .on('format', onPlaying)
        .on('finish', onFinished);

      function onPlaying(f) {
        var speaker = new Speaker(f);

        self.speaker = {};
        self.speaker.readableStream = this;
        self.speaker.Speaker = speaker;
        self.emit('playing', song);

        // This is where the song acturaly played end,
        // can't trigger playend event here cause
        // unpipe will fire this speaker's close event.
        this.pipe(speaker).on('close', function() {
          self.emit('stopped', song);
        });
      }

      function onFinished() {
        self.list = self.list.filter(function(i) {
          return i["_id"] != song._id
        });
        self.emit('playend', song);
        // switch to next one
        callback(null);
      }
    }
  }

}

/**
 * [Download a mp3 file from its URI]
 * @param  {String}   src      [the src URI of mp3 file]
 * @param  {Function} callback [callback with err and file stream]
 */
function download(src, callback) {
  var self = this;
  var called = false;
  var proxyReg = /http:\/\/((?:\d{1,3}\.){3}\d{1,3}):(\d+)/;
  var http_proxy = self.options.http_proxy;
  var request = src.indexOf('https') === 0 ? https : http;
  var query = src;

  if (http_proxy && proxyReg.test(http_proxy)) {
    var proxyGroup = http_proxy.match(proxyReg);
    query = {};
    query.path = src;
    query.host = proxyGroup[1];
    query.port = proxyGroup[2];
  }

  request
    .get(query, responseHandler)
    .on('error', errorHandler);

  function responseHandler(res){
    called = true;

    var isOk = (res.statusCode === 200);
    var isAudio = (res.headers['content-type'].indexOf('audio/mpeg') > -1);
    var isSave = self.options.cache;
    var isStream = self.options.stream;

    if (!isOk)
      return callback(new Error('Resource invalid'));
    if (isStream)
      return callback(null, res);
    if (!isAudio)
      return callback(new Error('Resource type is unsupported'));

    // Create a pool
    var pool = new PoolStream();
    // Pipe into memory
    res.pipe(pool);

    // Check if we're going to save this stream
    if (!isSave)
      return callback(null, pool);

    // Save this stream as file in download directory
    var file = path.join(
      self.options.downloads,
      utils.fetchName(src)
    );

    self.emit('downloading', src);
    pool.pipe(fs.createWriteStream(file));

    // Callback the pool
    callback(null, pool);
  }

  function errorHandler(err) {
    if (!called)
      callback(err);
  }
}

/**
 * [Read mp3 src and check if we're going to download it.]
 * @param  {String}   src    [mp3 file src, would be local path or URI (http/https)]
 * @param  {Function} callback [callback with err and file stream]
 */
function read(src, callback) {
  var isLocal = !(src.indexOf('http') == 0 || src.indexOf('https') == 0);

  // Read local file stream if not a valid URI
  if (isLocal)
    return callback(null, fs.createReadStream(src));

  var file = path.join(
    this.options.downloads,
    utils.fetchName(src)
  );

  if (fs.existsSync(file))
    return callback(null, fs.createReadStream(file));

  this.download(src, callback);
}

/**
 * [Stop playing and unpipe stream.
 * No params for now.]
 * @return {Bool} [always `false`]
 */
function stop() {
  if (!this.speaker)
    return false;

  this.speaker
    .readableStream
    .unpipe();

  this.speaker
    .Speaker
    .end();

  return false;
}

/**
 * [Stop playing and switch to next song,
 * if there is no next song, callback with a `No next` Error object.]
 * @param  {Function} callback [callback with err and next song.]
 * @return {Bool}
 */
function next(callback) {
  var list = this.list;
  var current = this.history[this.history.length - 1];
  var next = list[current._id + 1];
  var isCallback = callback && _.isFunction(callback);

  if (!next) {
    if (isCallback)
      return callback(new Error('No next'));

    return false;
  }

  this.stop();
  this.play('next', list.slice(next._id));

  return isCallback ? callback(null, next, current) : true;
}

/**
 * [Add a new song to the playlist,
 * if song provided is a String, convert it to a Song Object.]
 * @param {String|Object} song [the src URI of new song or the object of new song.]
 */
function addSong(song) {
  if (!this.list)
    this.list = [];

  var latest = _.isObject(song) ?
      song : {};

  latest._id = this.list.length;

  if (_.isString(song))
    latest.src = song;

  this.list.push(latest);
}

/**
 * [Bind some useful events,
 * @events.playing: on playing, keeping play history up to date.]
 */
function bindEvents() {
  var self = this;
  this.on('playing', function(song) {
    self.playing = song;
    self.history.push(song);
  });
}

/**
 * [Lists songs in the playlist,
 * Displays the src for each song returned in json]
 * @param {[type]} song [description]
 */
function playList() {
  if (!this.list)
    return;

  return JSON.stringify(this.list.map(function(el) {
    return el["src"];
  }));
}
