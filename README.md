# ![logo](http://ww2.sinaimg.cn/large/61ff0de3gw1e6xuxefgj1j200u00ugld.jpg) player ![](https://badge.fury.io/js/player.png)

a cli wrapper of node-lamp/node-speaker, support play `.mp3` audio file both from url and local songs. 

基于nodejs的命令行播放器，支持本地播放，播放列表，从url播放等设置；支持事件监听，比如捕获当前播放的歌曲，当前歌曲播放状态（是否完成）。

## How to install

````
$ npm install player
````

## Sample code

````javascript
var Player = require('player');

// create player instance
var src = './xxx.mp3';
Player.play(src,function(){
    console.log('done!')
});

// create play-list player instance
var player = Player.play([
    __dirname + '/demo.mp3',
    __dirname + '/demo2.mp3',
    __dirname + '/demo.mp3',
    // play .mp3 file from a URL
    // 从url播放，这个地址必须要求豆瓣电台登录（有cookie），如果直接播放这个地址跳出说明返回失败，请先在web版豆瓣电台上登录。然后执行demo
    'http://mr4.douban.com/201307241910/437febf501be2c32d3d0cccb7ce1353d/view/song/small/p1949332.mp3'
],function(player){
    // play done
    console.log(player)
    console.log('done!!!')
});

player.on('playing',function(item){
    // return playing item(object)
    console.log('im playing... id:' + item.sid);
});

player.on('playend',function(item){
    // return a playend item
    console.log('id:' + item.sid + ' play done, switching to next one ...');
});

player.on('error', function(err){
    // when error occurs
    console.log(err);
});

// stop playing
player.stop();
````

## Have a try

````
$ git clone https://github.com/turingou/player.git
$ cd player
$ npm install
$ node ./demo/demo.js
````

## Roadmap -> 0.1.0

- `[√]` player status supported
- `[ ]` add more custom configs

## Changelog

- `0.0.9` bugs fixed 
- `0.0.8` bugs fixed 
- `0.0.7` bugs fixed 修复了停止音乐播放的bug
- `0.0.6` player status supported 增加当前播放进度的支持，新增事件监听接口
- `0.0.5` bugs fixed 修复播放列表的几处bug
- `0.0.4` play from url supported 新增从url播放的接口
- `0.0.3` playlist supported 新增播放列表配置项