## ![player](http://ww2.sinaimg.cn/large/61ff0de3gw1eg98y1go77j201q00zwe9.jpg) player ![](https://badge.fury.io/js/player.png)

A command line player, supports play mp3 both from url and local stream.

Now support Node.js `v0.12.0` and io.js `v2.0.0`

### Installation

````
$ npm install player
````

### Player cli tool

```
$ [sudo] npm install player -g
$ player play demo.mp3 [anotherdemo.mp3 ... ]
```

### Example

````javascript
var Player = require('player');

// create player instance
var player = new Player('./xxx.mp3');

// play now and callback when playend
player.play(function(err, player){
  console.log('playend!');
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

// list songs in playlist
console.log(player.list)

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
$ node ./examples/local.js
$ node ./examples/online.js
$ node ./examples/next.js
````

### API

#### new Player(playList)

Init a new Player with provided `playList`

- `playList`: String|Array[String]

#### player.add(song)

Add a song to current `playlist`

- `song`: String|Object[src: String]

#### player.play()

Play right now

#### player.pause()

Pause or resume, if already paused

#### player.stop()

Stop playing, unpipe the source stream

#### player.next()

Switch to next song in the current playlist

#### player.on(eventName, callback)

- `eventName`: Would be `playing`, `playend` or `error`
- `callback`: The callback function

### Contributing
- Fork this repo
- Clone your repo
- Install dependencies
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Open a pull request, and enjoy <3

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
