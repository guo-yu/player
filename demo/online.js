var Player = require('../index');

// 播放
var player = new Player([
    __dirname + '/demo.mp3',
    'http://zhangmenshiting.baidu.com/data2/music/10470876/7343701219600128.mp3?xcode=351634fd3718fed5abb2f9389b9d4097b9319fcd4157c2b2'
]);

player.play();
