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

// 这里的src可以是地址，也可以是url，会转换成stream
exports.add = function(src) {
    if (src.indexOf('http') == 0 || src.indexOf('https') == 0) {
        return request(src);
    } else {
        return fs.createReadStream(src);
    }
};

// 播放
exports.play = function(song,callback) {

    var play = function(p,cb) {

        var playWrite = p.pipe( new lame.Decoder() );

        playWrite.on('format',function(f){
            this.pipe(new Speaker(f));
        })

        playWrite.on('finish',function(){
            if (cb) {
                cb();
            }
        });

    };

    if (song.length) {
        async.eachSeries(song,play,function(err){
            if (!err) {
                if (typeof(callback) == 'function') {
                    callback()
                }
            }
        });
    } else {
        play(song,callback)
    }

};

// 停止
exports.stop = function(song) {
    song.unpipe();
    return false;
}

// 暂停
exports.pause = function(song) {
    song.pause();
}