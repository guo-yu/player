/**
 *
 * @brief: command line interface mp3 player based on Node.js
 * @author: [turingou](http://guoyu.me)
 * @created: [2013/07/20]
 *
 **/

var fs = require('fs'),
    lame = require('lame'),
    async = require('async'),
    Speaker = require('speaker'),
    request = require('request'),
    path = require('path'),
    utils = require('./libs/utils');

var Player = function(songs, params) {
    if (!songs) return false;
    this.streams = [];
    this.speakers = [];
    this.list = (typeof(songs) === 'string') ? [{src: songs, _id: 0}] : utils.format(songs);
    this.status = 'ready';
    this.src = params && params.srckey ? params.srckey : 'src';
    this.downloads = params && params.downloads ? params.downloads : utils.getUserHome();
}

// 播放
Player.prototype.play = function(done, selected) {
    var self = this,
        songs = selected ? selected : self.list;
    if (!this.done && typeof(done) === 'function') self._done = done;
    var play = function(song, cb) {
        self.read((typeof(song) === 'string') ? song : song[self.src], function(err, p) {
            if (err) return cb(err);
            var l = new lame.Decoder();
            self.streams.push(l);
            p.pipe(l)
                .on('format', function(f) {
                    var s = new Speaker(f);
                    this.pipe(s);
                    self.speakers.push({
                        rs: this,
                        speaker: s
                    });
                    self.changeStatus('playing', song);
                })
                .on('finish', function() {
                    self.changeStatus('playend', song);
                    cb(null); // switch to next one
                });
            p.on('error', function(err) {
                self.changeStatus('error', err);
                cb(err);
            });
        });
    };
    if (self.list.length <= 0) return false;
    async.eachSeries(songs, play, function(err) {
        if (err) throw err;
        if (typeof(done) === 'function') done(err, self);
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
    this.play(this._done ? this._done : null, list.slice(next._id));
    return true;
}

Player.prototype.add = function(song) {
    if (!this.list) this.list = [];
    this.list.push(song);
}

Player.prototype.on = function(event, callback) {
    if (!this.event) this.event = {};
    this.event[event] = callback;
    return this;
}

Player.prototype.changeStatus = function(status, dist) {
    this.status = status;
    this[status] = dist;
    if (this.event && this.event[status] && typeof(this.event[status]) == 'function') {
        this.event[status](this[status]);
    }
}

Player.prototype.stop = function() {
    if (!(this.streams && this.streams.length && this.streams.length > 0)) return false;
    this.speakers[this.speakers.length - 1].rs.unpipe();
    this.speakers[this.speakers.length - 1].speaker.end();
    return false;
}

Player.prototype.download = function(src, callback) {
    var self = this;
    request.get(src, {
        encoding: null
    }, function(err, res, buff) {
        if (err) return callback(err);
        var filename = utils.fetchName(src);
        fs.writeFile(path.join(self.downloads, filename), buff, function(err) {
            callback(err, path.join(self.downloads, filename));
        });
    });
}

Player.prototype.read = function(src, callback) {
    var self = this;
    if (!(src.indexOf('http') == 0 || src.indexOf('https') == 0)) return callback(null, fs.createReadStream(src));
    var filename = utils.fetchName(src);
    fs.exists(path.join(self.downloads, filename), function(exists) {
        if (exists) return callback(null, fs.createReadStream(path.join(self.downloads, filename)));
        self.changeStatus('downloading', src);
        self.download(src, function(err, file) {
            if (err) return callback(err);
            callback(null, fs.createReadStream(file));
        });
    });
}

module.exports = Player;
