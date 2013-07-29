# ![logo](http://ww2.sinaimg.cn/large/61ff0de3gw1e6xuxefgj1j200u00ugld.jpg) player ![](https://badge.fury.io/js/player.png)

基于nodejs的命令行播放器，支持本地播放，播放列表，从url播放等设置；支持事件监听，比如捕获当前播放的歌曲，当前歌曲播放状态（是否完成）。

### 如何安装

`npm install player`

### 如何使用

````javascript
var Player = require('player');

// 播放单曲
var src = './xxx.mp3';
Player.play(src,function(){
    console.log('done!')
});

// 按列表顺序播放并获取实例化的播放列表
var player = Player.play([
    __dirname + '/demo.mp3',
    __dirname + '/demo2.mp3',
    __dirname + '/demo.mp3',
    // 从url播放，这个地址必须要求豆瓣电台登录（有cookie），如果直接播放这个地址跳出说明返回失败，请先在web版豆瓣电台上登录。然后执行demo
    'http://mr4.douban.com/201307241910/437febf501be2c32d3d0cccb7ce1353d/view/song/small/p1949332.mp3'
],function(player){
    // 当全部播放完成后，获取实例化的player
    console.log(player)
    console.log('done!!!')
});

player.on('playing',function(item){
    // 监听正在播放的曲目
    console.log('im playing... id:' + item.sid);
});

player.on('playend',function(item){
    // 当一首歌播放完时
    console.log('id:' + item.sid + ' play done, switching to next one ...');
});

player.on('error', function(err){
    // 当流媒体出现播放错误时
    console.log(err);
});

// 停止播放
player.stop();
````

### 戴上耳机，试试看：

````
$ git clone https://github.com/turingou/player.git
$ cd player
$ npm install
$ node ./demo/demo.js
````

### Roadmap -> 0.1.0

- `[√]` 增加当前播放进度的支持
- `[ ]` 增加间隔时间等配置项

### Changelog

- `0.0.7` 修复了停止音乐播放的bug
- `0.0.6` 增加当前播放进度的支持，新增事件监听接口
- `0.0.5` 修复播放列表的几处bug
- `0.0.4` 新增从url播放的接口
- `0.0.3` 新增播放列表配置项