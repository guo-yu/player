var Player = require('../index');

// 播放
var player = new Player([
    __dirname + '/demo.mp3',
    __dirname + '/demo2.mp3'
]);

player.play(function(err, p){
    console.log('播放完了！');
});

player.on('downloading',function(item){
    console.log('im downloading... src:' + item);
});

player.on('playing',function(item){
    console.log('im playing... ');
    console.log(item);
    setTimeout(function(){
        player.stop()
    },2000)
});

player.on('playend',function(item){
    console.log('play done, switching to next one ...');
    player.add('http://zhangmenshiting.baidu.com/data2/music/10470876/7343701219600128.mp3?xcode=351634fd3718fed5abb2f9389b9d4097b9319fcd4157c2b2')
});

player.on('error', function(err){
    // 当流媒体出现播放错误时
    console.log('Opps... 流媒体发生错误!')
    console.log(err);
});
