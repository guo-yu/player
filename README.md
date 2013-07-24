# ![logo](http://ww2.sinaimg.cn/large/61ff0de3gw1e6xuxefgj1j200u00ugld.jpg) player ![](https://badge.fury.io/js/player.png)

基于nodejs的命令行播放器

### 如何安装

`npm install player`

### 如何使用

````javascript
var player = require('player');

// 播放demo.mp3
var song = player.add( __dirname + '/demo.mp3');
var song2 = player.add( __dirname + '/demo2.mp3');

// 从url播放
var websong = player.add( 'http://mr4.douban.com/201307241505/dea5ad99cf4676846599982159ba1bd9/view/song/small/p1948904.mp3' )

// 马上播放demo.mp3
player.play(song,function(){
    console.log('done!')
});

// 按列表顺序播放
player.play([song,song2],function(){
    console.log('done!!!')
});

// 3秒后停止播放
setTimeout(function(){
    player.stop(song);
},3000);
````

### 戴上耳机，试试看：

````
$ git clone https://github.com/turingou/player.git
$ cd player
$ npm install
$ node ./demo/demo.js
````

### Changelog

- `0.0.4` 新增从url播放的接口
- `0.0.3` 新增播放列表配置项