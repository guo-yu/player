var player = require('../index');

// 播放
player.play([
    __dirname + '/demo.mp3',
    __dirname + '/demo2.mp3'
],function(player){
    console.log('done!!!')
});