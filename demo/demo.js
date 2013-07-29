var Player = require('../index');

// 播放
var player = Player.play([
    __dirname + '/demo.mp3',
    __dirname + '/demo2.mp3',
    __dirname + '/demo.mp3'
],function(player){
    // 当播放完成后，获取实例化的player
    console.log(player)
    console.log('done!!!')
});

player.on('playing',function(item){
    // 监听正在播放的曲目
    console.log('im playing... id:' + item.sid);
    setTimeout(function(){
        console.log('it is time!!!')
        player.stop();
    },2000);
})

player.on('playend',function(item){
    console.log('id:' + item.sid + ' play done, switching to next one ...');
});

player.on('error', function(err){
    // 当流媒体出现播放错误时
    console.log(err);
});