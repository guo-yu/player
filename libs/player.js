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

  if (done) this.on('done', _.isFunction(done) ? done : function(){});
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

Player.prototype.download = function(src, callback) {  
  var self = this;
  var request = src.indexOf('https') !== -1 ? https : http;
  var called = false;

  request.get(src, function(res) {
    called = true;

    var isOk = (res.statusCode === 200);
    var isAudio = (res.headers['content-type'].indexOf('audio/mpeg') > -1);
    var isSave = self.options.cache;

    if (!isOk) return callback(new Error('resource invalid'));
    if (!isAudio) return callback(new Error('resource type is unsupported'));

    // 创建pool
    var pool = new PoolStream();
    // 先放进内存
    res.pipe(pool);

    // 检查是否需要保存
    if (!isSave) return callback(null, pool);

    // 保存到本地
    var file = path.join(self.options.downloads, utils.fetchName(src));
    self.emit('downloading', src);
    pool.pipe(fs.createWriteStream(file));

    // 返回网络流
    callback(null, pool);

  }).on('error', function(err) {
    if (!called) callback(err);
  });
}

Player.prototype.read = function(src, callback) {
  var isLocal = !(src.indexOf('http') == 0 || src.indexOf('https') == 0);
  if (isLocal) return callback(null, fs.createReadStream(src));

  var file = path.join(this.options.downloads, utils.fetchName(src));
  if (fs.existsSync(file)) return callback(null, fs.createReadStream(file));

  this.download(src, callback);
}

Player.prototype.stop = function() {
  if (!this.speaker) return false;
  this.speaker.readableStream.unpipe();
  this.speaker.Speaker.end();
  return false;
}

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
  this.play(null, list.slice(next._id));
  return callback(null, next);
}

Player.prototype.add = function(song) {
  if (!this.list) this.list = [];
  var latest = _.isObject(song) ? song : {};
  latest._id = this.list.length;
  if (_.isString(song)) latest.src = song;
  this.list.push(latest);
}

Player.prototype.bindEvents = function() {
  var self = this;
  this.on('playing', function(song) {
    self.history.push(song);
  });
}