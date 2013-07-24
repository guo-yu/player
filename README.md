# ![logo](http://ww2.sinaimg.cn/large/61ff0de3gw1e6xuxefgj1j200u00ugld.jpg) player ![](https://badge.fury.io/js/player.png)

基于nodejs的命令行播放器，支持本地播放，播放列表，从url播放等设置。

### 如何安装

`npm install player`

### 如何使用

````javascript
var player = require('player');

// 播放demo.mp3
var song =  __dirname + '/demo.mp3';
var song2 =  __dirname + '/demo2.mp3';

// 从url播放，这个地址必须要求豆瓣电台登录（有cookie），如果直接播放这个地址跳出说明返回失败，请先在web版豆瓣电台上登录。然后执行demo
var websong = 'http://mr4.douban.com/201307241910/437febf501be2c32d3d0cccb7ce1353d/view/song/small/p1949332.mp3';

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
    player.stop();
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