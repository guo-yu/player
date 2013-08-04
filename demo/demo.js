var Player = require('../index');

// 播放
var player = Player.play([
    'http://mr4.douban.com/201308041622/f7509bc6861b2ad4fd34ba8f3618269d/view/song/small/p1953253.mp3',
    'http://mr3.douban.com/201308041622/8d830a67b1e543ef26a8f2c700df01a1/view/song/small/p1953147.mp3',
    __dirname + '/demo.mp3'
],function(player){
    // 当播放完成后，获取实例化的player
    console.log(player)
    console.log('done!!!')
});

player.on('playing',function(item){
    // 监听正在播放的曲目
    console.log('im playing... id:' + item.sid);
    // setTimeout(function(){
    //     console.log('it is gona stop !!!');
    //     player.stop();
    // },3000);
})

player.on('playend',function(item){
    console.log('id:' + item.sid + ' play done, switching to next one ...');
});

player.on('error', function(err){
    // 当流媒体出现播放错误时
    console.log(err);
});