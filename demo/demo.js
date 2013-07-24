var player = require('../index');

// 播放demo.mp3
var song = player.add( __dirname + '/demo.mp3');
var song2 = player.add( __dirname + '/demo2.mp3');

// Blood on My Knuckles
var websong = player.add( 'http://mr4.douban.com/201307241505/dea5ad99cf4676846599982159ba1bd9/view/song/small/p1948904.mp3' )

// 马上播放demo.mp3
player.play([song1,song2],function(){
    console.log('done!!!')
});