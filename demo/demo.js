var player = require('../index');

// 播放demo.mp3
var song = player.add( __dirname + '/demo.mp3');
var song2 = player.add( __dirname + '/demo2.mp3');

// Blood on My Knuckles
var websong = player.add( 'http://mr4.douban.com/201307241910/437febf501be2c32d3d0cccb7ce1353d/view/song/small/p1949332.mp3' )

// 马上播放demo.mp3
player.play([song,song2],function(){
    console.log('done!!!')
});