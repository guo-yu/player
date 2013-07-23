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
    async = require('async');

exports.add = function(src) {
    return fs.createReadStream(src);
};

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

exports.stop = function(song) {
    song.unpipe();
    return false;
}

exports.pause = function(song) {
    song.pause();
}