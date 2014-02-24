// fetch user's home
exports.getUserHome = function() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};

// fetch  filename
exports.fetchName = function(str) {
    var filename = str.substr(str.lastIndexOf('/') + 1);
    // 过滤 http://domain.com/xxx.mp3?xcode=fasda
    if (filename.indexOf('?') !== -1) {
        var parts = filename.split('?');
        filename = parts[0];
    }
    return filename;
};

// format songs 
exports.format = function(list) {
    var songs = [];
    
    if (typeof(list) === 'string') {
        songs.push({
            src: list,
            _id: 0
        });
        return songs;
    }

    list.forEach(function(item, index){
        if (typeof(item) === 'object') {
            item._id = index;
            songs.push(item);
        } else {
            songs.push({
                src: item,
                _id: index
            });
        }
    });
    return songs;
};
