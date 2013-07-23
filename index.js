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

exports.play = function(song) {
    
    var play = function(p,cb) {
        p.pipe( new lame.Decoder())
            .on('format',function(f){
                this.pipe(new Speaker(f))
            })
            .on('finish',function(){
                cb();
            });
    };

    if (song.length) {
        async.eachSeries(song,play,function(err){
            if (!err) {
                console.log('done')
            }
        });
    } else {
        play(song)
    }

    return song;
};

exports.stop = function(song) {
    song.unpipe();
    return false;
}