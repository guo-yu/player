/**
 *
 * cli player
 * @author: [turingou]
 * @created: [2013/07/20]
 *
 **/

var lame = require('lame'),
    Speaker = require('speaker'),
    fs = require('fs'),
    async = require('async'),
    request = require('request');

var Player = function(list) {
    this.streams = [];
    this.speakers = [];
    this.list = [];
    this.status = 'ready';
    var self = this;
    (function(list) {
        for (var i = 0; i < list.length; i++) {
            self.list.push({
                sid: i + 1,
                src: list[i]
            });
        };
    })(list);
}

// 监听事件
Player.prototype.on = function(event, cb) {
    // 将事件监听寄存在对象里，不立即执行
    if (!this.event) {
        this.event = {};
    }
    this.event[event] = cb;
    return this;
}

// 改变播放情况
Player.prototype.changeStatus = function(status, dist) {
    this.status = status;
    this[status] = dist;
    if (this.event && this.event[status] && typeof(this.event[status]) == 'function') {
        this.event[status](this[status]);
    }
}

// 停止播放
Player.prototype.stop = function() {
    if (this.streams && this.streams.length && this.streams.length > 0) {
        this.speakers[this.speakers.length - 1].unpipe();
        this.streams[this.streams.length - 1].unpipe();
        return false;
    } else {
        return false;
    }
}

// 读取文件流
exports.read = function(src, cb) {
    if (src.indexOf('http') == 0 || src.indexOf('https') == 0) {
        // 直接这样返回stream是无法unpipe的
        cb(request(src));
    } else {
        cb(fs.createReadStream(src));
    }
}

// 播放
exports.play = function(songs, callback) {

    var init = function(song) {
        var list = (typeof(song) == 'string') ? [song] : song;
        var player = new Player(list);
        return player;
    }

    var play = function(dist, cb) {
        // reading file from url may occurs read error
        exports.read(dist.src, function(p) {
            var l = new lame.Decoder();
            player.streams.push(l);
            p.pipe(l)
                .on('format', function(f) {
                    var s = new Speaker(f);
                    this.pipe(s);
                    player.speakers.push(this);
                    player.changeStatus('playing', dist);
                })
                .on('finish', function() {
                    if (cb) {
                        player.changeStatus('playend', dist);
                        cb();
                    }
                });
            p.on('error', function(err) {
                player.changeStatus('error', err);
            });
        });
    };

    var player = init(songs);
    if (player.list.length > 0) {
        async.eachSeries(player.list, play, function(err) {
            if (!err) {
                if (typeof(callback) == 'function') {
                    callback(player)
                }
            }
        });
        return player;
    }
};