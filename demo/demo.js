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
    console.log('im playing... id:' + item);
    setTimeout(function(){
        // console.log('it is gona stop !!!');
        player.next();
    },3000);
});

player.on('playend',function(item){
    console.log('id:' + item + ' play done, switching to next one ...');
    player.add('http://mr3.douban.com/201311060138/ff24f519d981a0a9c76989d9b360ff9c/view/song/small/p1027380.mp3')
});

player.on('error', function(err){
    // 当流媒体出现播放错误时
    console.log('Opps... 流媒体发生错误!')
    console.log(err);
});