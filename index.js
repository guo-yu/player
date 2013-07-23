/**
 *
 * cli player
 * @author: [turingou]
 * @created: [2013/07/20]
 *
 **/

var lame = require('lame'),
    Speaker = require('speaker'),
    fs = require('fs');

exports.add = function(src) {
    return fs.createReadStream(src);
};

exports.play = function(player) {
    player.pipe( new lame.Decoder())
    .on('format',function(f){
        this.pipe(new Speaker(f))
    });
    return single;
};

exports.stop = function(player) {
    player.unpipe();
    return false;
}