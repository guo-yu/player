/**
 *
 * command line interface mp3 player based on Node.js
 * @author: [turingou]
 * @created: [2013/07/20]
 *
 **/

var fs = require('fs'),
    lame = require('lame'),
    async = require('async'),
    Speaker = require('speaker'),
    request = require('request');

var fetchName = function(str) {
    return str.substr(str.lastIndexOf('/') + 1);
};

var Player = function(songs) {
    this.streams = [];
    this.speakers = [];
    if (songs) this.list = (typeof(songs) === 'string') ? [songs] : songs;
    this.status = 'ready';
}

// 播放
Player.prototype.play = function(done) {
    var self = this;
    var play = function(song, cb) {
        self.read((typeof(song) === 'string') ? song : song.src, function(p) {
            var l = new lame.Decoder();
            self.streams.push(l);
            p.pipe(l)
                .on('format', function(f) {
                    var s = new Speaker(f);
                    this.pipe(s);
                    self.speakers.push(this);
                    self.changeStatus('playing', song);
                })
                .on('finish', function() {
                    self.changeStatus('playend', song);
                    if (cb) cb();
                });
            p.on('error', function(err) {
                self.changeStatus('error', err);
            });
        });
    };
    if (self.list.length > 0) {
        async.eachSeries(self.list, play, function(err) {
            if (!err) {
                if (typeof(done) === 'function') {
                    done(self);
                } else {
                    return true;
                }
            } else {
                throw err;
            }
        });
        return self;
    } else {
        return false;
    }
};

Player.prototype.add = function(song) {
    if (!this.list) this.list = [];
    this.list.push(song);
}

Player.prototype.on = function(event, callback) {
    if (!this.event) {
        this.event = {};
    }
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
    if (this.streams && this.streams.length && this.streams.length > 0) {
        this.speakers[this.speakers.length - 1].unpipe();
        this.streams[this.streams.length - 1].unpipe();
        return false;
    } else {
        return false;
    }
}

Player.prototype.download = function(src, callback) {
    request.get(src, {
        encoding: null
    }, function(err, res, buff) {
        if (!err) {
            var filename = fetchName(src);
            fs.writeFile(filename, buff, function(err) {
                callback(err, filename);
            });
        } else {
            callback(err);
        }
    });
}

Player.prototype.read = function(src, callback) {
    var self = this;
    if (src.indexOf('http') == 0 || src.indexOf('https') == 0) {
        var filename = fetchName(src);
        fs.exists(filename, function(exists) {
            if (exists) {
                callback(fs.createReadStream(filename));
            } else {
                self.changeStatus('downloading', src);
                self.download(src, function(err, file) {
                    if (!err) {
                        callback(fs.createReadStream(file));
                    } else {
                        throw err;
                    }
                });
            }
        });
        // callback(request(src));
    } else {
        callback(fs.createReadStream(src));
    }
}

module.exports = Player;