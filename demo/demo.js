var Player = require('../index');

// 播放
var player = new Player([
    "http://mr3.douban.com/201311060138/10de7d2800291d0e0d6675b949769c64/view/song/small/p107686.mp3",
    __dirname + '/demo.mp3'
]);

player.play(function(p){
    console.log('播放完了！')
});

player.on('downloading',function(item){
    console.log('im downloading... src:' + item);
});

player.on('playing',function(item){
    console.log('im playing... id:' + item);
    // setTimeout(function(){
    //     console.log('it is gona stop !!!');
    //     player.stop();
    // },3000);
});

player.on('playend',function(item){
    console.log('id:' + item + ' play done, switching to next one ...');
});

player.on('error', function(err){
    // 当流媒体出现播放错误时
    console.log('Opps... 流媒体发生错误!')
    console.log(err);
});