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

var player = {};

// 读取文件流
exports.read = function(src,cb) {
    if (src.indexOf('http') == 0 || src.indexOf('https') == 0) {
        cb(request(src));
    } else {
        cb(fs.createReadStream(src));
    }
}

// 播放
exports.play = function(song,callback) {

    player['list'] = [];

    var play = function(dist,cb) {
        exports.read(dist,function(p){
            player.list.push(p);
            p.pipe(new lame.Decoder())
                .on('format',function(f){
                    this.pipe(new Speaker(f));
                })
                .on('finish',function(){
                    if (cb) {
                        cb();
                    }
                });
        });
    };

    if (song.length) {
        async.eachSeries(song,play,function(err){
            if (!err) {
                if (typeof(callback) == 'function') {
                    callback(player)
                }
            }
        });
    } else {
        play(song,callback)
    }

};

// 停止
exports.stop = function() {
    if (player.list && player.list.length) {
        for (var i = 0; i < playList.length; i++) {
            playList[i].unpipe()
        };
    }
    return false;
}