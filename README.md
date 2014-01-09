## ![logo](http://ww2.sinaimg.cn/large/61ff0de3gw1e6xuxefgj1j200u00ugld.jpg) player ![](https://badge.fury.io/js/player.png)

a cli wrapper of node-speaker, support play `.mp3`s both from url and local songs.

### Installation

````
$ npm install player
````

### Example

````javascript
var Player = require('player');

// create player instance
var player = new Player('./xxx.mp3');

// play now and callback when playend
player.play(function(err, player){
    console.log('playend!')
});

// create a player instance from playlist
var player = Player([
    __dirname + '/demo.mp3',
    __dirname + '/demo2.mp3',
    __dirname + '/demo.mp3',
    // play .mp3 file from a URL
    'http://mr4.douban.com/blablablabla/p1949332.mp3'
]);

// play again
player.play();

// play the next song, if any
player.next();

// add another song to playlist
player.add('http://someurl.com/anothersong.mp3');

// event: on playing
player.on('playing',function(item){
    console.log('im playing... src:' + item);
});

// event: on playend
player.on('playend',function(item){
    // return a playend item
    console.log('src:' + item + ' play done, switching to next one ...');
});

// event: on error
player.on('error', function(err){
    // when error occurs
    console.log(err);
});

// stop playing
player.stop();
````

### Have a try

````
$ git clone https://github.com/turingou/player.git
$ cd player
$ npm install .
$ node ./demo/demo.js
````

### API
check this file: `index.js`

### Contributing
- Fork this repo
- Clone your repo
- Install dependencies
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Open a pull request, and enjoy <3

### Changelog

 * 0.1.0: ship to 0.1.0, stream unpipe bugs fixed
 * 0.1.0: Bugs fixed
 * 0.1.0: add mp3 downloader
 * 0.1.0: code rewriting
 * bugs fixed , ship to 0.0.9
 * update readme
 * update readme
 * ship to 0.0.8
 * ship to 0.0.7
 * 新增事件监听接口 ship to 0.0.6
 * ship to 0.0.5
 * add new url
 * fixed demo bugs
 * ship to 0.0.4 新增从url播放
 * add logo
 * add callback
 * 修改一个硬编码问题
 * ship to 0.0.3
 * ship to 0.0.2 & add demo

### MIT license
Copyright (c) 2014 turing &lt;o.u.turing@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---
![docor](https://cdn1.iconfinder.com/data/icons/windows8_icons_iconpharm/26/doctor.png)
built upon love by [docor](https://github.com/turingou/docor.git) v0.1.2
