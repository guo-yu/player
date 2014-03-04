var Player = require('../index');

var player = new Player([
    __dirname + '/demo.mp3',
    __dirname + '/demo2.mp3'
]);

player.play(function(err, p){
    console.log('all songs play end');
});

player.on('downloading',function(item){
    console.log('im downloading... src:' + item);
});

player.on('playing',function(item){
    console.log('im playing... ');
    console.log(item);
});

player.on('playend',function(item){
    console.log('play done, switching to next one ...');
});

player.on('error', function(err){
    console.log('Opps...!')
    console.log(err);
});
