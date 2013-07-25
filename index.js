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

var _Player = function(list) {
    this.streams = [];
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
_Player.prototype.on = function(event, cb) {
    // 将事件监听寄存在对象里，不立即执行
    if (!this.event) {
        this.event = {};
    }
    this.event[event] = cb;
    return this;
}

// 改变播放情况
_Player.prototype.changeStatus = function(status, dist) {
    this.status = status;
    this[status] = dist;
    if (this.event && this.event[status] && typeof(this.event[status]) == 'function') {
        this.event[status](this[status]);
    }
}

// 读取文件流
exports.read = function(src, cb) {
    if (src.indexOf('http') == 0 || src.indexOf('https') == 0) {
        cb(request(src));
    } else {
        cb(fs.createReadStream(src));
    }
}

// 播放
exports.play = function(songs, callback) {

    var init = function(song) {
        var list = (typeof(song) == 'string') ? [song] : song;
        var player = new _Player(list);
        return player;
    }

    var play = function(dist, cb) {
        exports.read(dist.src, function(p) {
            player.streams.push(p);
            p.pipe(new lame.Decoder())
                .on('format', function(f) {
                    this.pipe(new Speaker(f));
                    player.changeStatus('playing', dist);
                })
                .on('error', function(err){
                    player.changeStatus('error', dist);
                })
                .on('finish', function() {
                    if (cb) {
                        player.changeStatus('playend', dist);
                        cb();
                    }
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

// 停止
exports.stop = function(list) {
    if (list.streams && list.streams.length) {
        for (var i = 0; i < list.streams.length; i++) {
            list.streams[i].unpipe()
        };
    }
    return false;
}