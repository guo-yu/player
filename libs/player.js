/**
*
* Command line interface mp3 player based on Node.js
* @author: [turingou](http://guoyu.me)
* @created: [2013/07/20]
*
**/

var fs = require('fs');
var path = require('path');
var util = require("util");
var http = require('http');
var https = require('https');
var events = require("events");
var lame = require('lame');
var async = require('async');
var _ = require('underscore');
var Speaker = require('speaker');
var PoolStream = require('pool_stream');
var utils = require('./utils');

var defaults = {
  src: 'src',
  cache: false,
  downloads: utils.getUserHome()
};

module.exports = Player;

function errHandler(err) {
  if (err) throw err;
  return false;
}

function Player(songs, params) {
  if (!songs) return false;
  this.list = utils.format(songs);
  this.history = [];
  this.options = _.extend(defaults, params);
  this.bindEvents();
  events.EventEmitter.call(this);
};

util.inherits(Player, events.EventEmitter);

/**
*
* Play a mp3 list
* @done [Function]: the callback function when all mp3s play end.
* @select [Object]: the selected mp3 object.
*
**/
Player.prototype.play = function(done, selected) {
  var self = this;

  if (done !== 'next') this.on('done', _.isFunction(done) ? done : errHandler);
  if (this.list.length <= 0) return false;
  
  async.eachSeries(selected || this.list, play, function(err) {
    self.emit('done', err);
  });

  function play(song, callback) {
    var url = _.isString(song) ? song : song[self.options.src];
    self.read(url, function(err, pool) {
      if (err) return callback(err);
      pool.pipe(new lame.Decoder())
      .on('format', function(f) {
        var speaker = new Speaker(f);
        self.speaker = {};
        self.speaker.readableStream = this;
        self.speaker.Speaker = speaker;
        self.emit('playing', song);
        // this is where the song acturaly played end,
        // can't trigger playend event here cause
        // unpipe will fire this speaker's close event.
        this.pipe(speaker).on('close', function() {
          self.emit('stopped', song);
        });
      })
      .on('finish', function() {
        self.emit('playend', song);
        // switch to next one
        callback(null);
      })
    });
  }

}

/**
*
* download a mp3 via its URI
* @src [String]: the src URI of mp3 file
* @callback [Function]: callback with err and file stream
*
**/
Player.prototype.download = function(src, callback) {  
  var self = this;
  var request = src.indexOf('https') === 0 ? https : http;
  var called = false;

  request.get(src, function(res) {
    called = true;

    var isOk = (res.statusCode === 200);
    var isAudio = (res.headers['content-type'].indexOf('audio/mpeg') > -1);
    var isSave = self.options.cache;

    if (!isOk) return callback(new Error('resource invalid'));
    if (!isAudio) return callback(new Error('resource type is unsupported'));

    // create pool
    var pool = new PoolStream();
    // pipe into memory
    res.pipe(pool);

    // check if we're going to save stream
    if (!isSave) return callback(null, pool);

    // save stream to download dir
    var file = path.join(self.options.downloads, utils.fetchName(src));
    self.emit('downloading', src);
    pool.pipe(fs.createWriteStream(file));

    // callback the pool
    callback(null, pool);

  }).on('error', function(err) {
    if (!called) callback(err);
  });
}

/**
*
* Read mp3 src and check if we're going to download it.
* @src [String]: the src url of mp3 file, would be local path or URI(http or https)
* @callback [Function]: callback with err and file stream
*
**/
Player.prototype.read = function(src, callback) {
  var isLocal = !(src.indexOf('http') == 0 || src.indexOf('https') == 0);
  if (isLocal) return callback(null, fs.createReadStream(src));

  var file = path.join(this.options.downloads, utils.fetchName(src));
  if (fs.existsSync(file)) return callback(null, fs.createReadStream(file));

  this.download(src, callback);
}

/**
*
* Stop playing and unpipe stream.
* No params for now.
*
**/
Player.prototype.stop = function() {
  if (!this.speaker) return false;
  this.speaker.readableStream.unpipe();
  this.speaker.Speaker.end();
  return false;
}

/**
*
* Stop playing and switch to next song.
* if there is no next song, callback with a `no next` Error object.
* @callback[Function]: callback with err and next song.
*
**/
Player.prototype.next = function(callback) {
  var list = this.list;
  var current = this.history[this.history.length - 1];
  var next = list[current._id + 1];
  var isCallback = callback && _.isFunction(callback);

  if (!next) {
    if (isCallback) return callback(new Error('no next'));
    return false;
  }

  this.stop();
  this.play('next', list.slice(next._id));
  return isCallback ? callback(null, next, current) : true;
}

/**
*
* Add a new song to the playlist.
* if song provided is a String, convert it to a Song Object.
* @song[String|Object]: the src URI of new song or the object of new song.
*
**/
Player.prototype.add = function(song) {
  if (!this.list) this.list = [];
  var latest = _.isObject(song) ? song : {};
  latest._id = this.list.length;
  if (_.isString(song)) latest.src = song;
  this.list.push(latest);
}

/**
*
* Bind some useful events
* @events.playing: on playing, keeping play history up to date.
*
**/
Player.prototype.bindEvents = function() {
  var self = this;
  this.on('playing', function(song) {
    self.playing = song;
    self.history.push(song);
  });
}