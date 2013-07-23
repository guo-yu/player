# player ![](https://badge.fury.io/js/player.png)
---

基于nodejs的命令行播放器

### 如何安装

`npm install player`

### 如何使用

````javascript
var player = require('player');

// 播放demo.mp3
var song = player.add('./demo/demo.mp3');

// 马上播放demo.mp3
song.play();

// 3秒后停止播放
setTimeout(function(){
    song.stop()
},3000);
````