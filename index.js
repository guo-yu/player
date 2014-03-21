/**
 *
 * @brief: command line interface mp3 player based on Node.js
 * @author: [turingou](http://guoyu.me)
 * @created: [2013/07/20]
 *
 **/

var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    https = require('https'),
    lame = require('lame'),
    async = require('async'),
    _ = require('underscore'),
    Speaker = require('speaker'),
    PoolStream = require('pool_stream'),
    utils = require('./libs/utils');

var defaults = {
    src: 'src',
    downloads: utils.getUserHome(),
    cache: false
}

var Player = function(songs, params) {
    if (!songs) return false;
    this.speakers = [];
    this.list = utils.format(songs);
    this.status = 'ready';
    this.options = _.extend(defaults, params);
}

// 播放
Player.prototype.play = function(done, selected) {
    var self = this;
    if (!self._done && typeof(done) === 'function') self._done = done;
    var play = function(song, cb) {
        var url = (typeof(song) === 'string') ? song : song[self.options.src];
        self.read(url, function(err, pool) {
            if (err) return cb(err);
            pool.pipe(new lame.Decoder())
                .on('format', function(f) {
                    var speaker = new Speaker(f);
                    self.speakers.push({
                        rs: this,
                        speaker: speaker
                    });
                    self.changeStatus('playing', song);
                    this.pipe(speaker).on('close', function() {
                        // can't trigger playend event here cause
                        // unpipe will fire this speaker's close event
                        self.changeStatus('stopped', song);
                    });
                })
                .on('finish', function(){
                    self.changeStatus('playend', song);
                    cb(null); // switch to next one
                })
        });
    };
    if (self.list.length <= 0) return false;
    async.eachSeries(selected || self.list, play, function(err) {
        if (self._done) return self._done(err, self);
        if (err) throw err;
        return true;
    });
    return self;
};

Player.prototype.next = function() {
    if (this.status !== 'playing') return false;
    var playing = this.playing,
        list = this.list,
        next = list[playing._id + 1];
    if (!next) return false;
    this.stop();
    this.play(this._done || null, list.slice(next._id));
    return true;
}

Player.prototype.add = function(song) {
    if (!this.list) this.list = [];
    var latest = (typeof(song) === 'object') ? song : {};
    latest._id = this.list.length;
    if (typeof(song) === 'string') latest.src = song;
    this.list.push(latest);
}

Player.prototype.on = function(event, callback) {
    if (!this.event) this.event = {};
    this.event[event] = callback;
    return this;
}

Player.prototype.changeStatus = function(status, dist) {
    this.status = status;
    this[status] = dist;
    var isEvent = this.event && this.event[status] && typeof(this.event[status]) == 'function';
    if (isEvent) return this.event[status](this[status]);
    return this.status;
}

Player.prototype.stop = function() {
    if (this.speakers.length === 0) return false;
    this.speakers[this.speakers.length - 1].rs.unpipe();
    this.speakers[this.speakers.length - 1].speaker.end();
    return false;
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
        self.changeStatus('downloading', src);
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

module.exports = Player;
