var Player = require('../index');

// 播放
var player = new Player([
  'http://zhangmenshiting.baidu.com/data2/music/87718421/12625981392238861128.mp3?xcode=9536e381c2c7c25e16f385a5ce42f1814f5e48fa25a532b2',
  'http://zhangmenshiting.baidu.com/data2/music/64563852/6237481392260461128.mp3?xcode=40466e6da26181d4177a6ad8600acae54f5500234571548e'
]);

player.play();