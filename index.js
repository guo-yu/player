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
    path = require('path');

var getUserHome = function() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};

var fetchName = function(str) {
    return str.substr(str.lastIndexOf('/') + 1);
};

var Player = function(songs, params) {
    this.streams = [];
    this.speakers = [];
    if (songs) this.list = (typeof(songs) === 'string') ? [songs] : songs;
    this.status = 'ready';
    this.src = params && params.srckey ? params.srckey : 'src';
    this.downloads = params && params.downloads ? params.downloads : getUserHome();
}

// 播放
Player.prototype.play = function(done, selected) {
    var self = this;
    var play = function(song, cb) {
        self.read((typeof(song) === 'string') ? song : song[self.src], function(err, p) {
            if (!err) {
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
                        cb(null); // switch to next one
                    });
                p.on('error', function(err) {
                    self.changeStatus('error', err);
                    cb(err);
                });
            } else {
                cb(err);
            }
        });
    };
    if (self.list.length > 0) {
        async.eachSeries(selected ? selected : self.list, play, function(err) {
            if (typeof(done) === 'function') {
                done(err, self);
            } else {
                if (err) throw err;
            }
            return true;
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
    var self = this;
    request.get(src, {
        encoding: null
    }, function(err, res, buff) {
        if (!err) {
            var filename = fetchName(src);
            fs.writeFile(path.join(self.downloads, filename), buff, function(err) {
                callback(err, path.join(self.downloads, filename));
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
        fs.exists(path.join(self.downloads, filename), function(exists) {
            if (exists) {
                callback(null, fs.createReadStream(path.join(self.downloads, filename)));
            } else {
                self.changeStatus('downloading', src);
                self.download(src, function(err, file) {
                    if (!err) {
                        callback(null, fs.createReadStream(file));
                    } else {
                        callback(err);
                    }
                });
            }
        });
    } else {
        callback(null, fs.createReadStream(src));
    }
}

module.exports = Player;