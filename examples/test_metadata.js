var fs = require('fs');
var mm = require('musicmetadata');

var parser = mm(fs.createReadStream('demo3_with_metadata.mp3'),{ duration: true }, function (err, metadata) {
    if (err) {
        console.log(err);
    }
    console.log(metadata);
});
