// fetch user's home
exports.getUserHome = function() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};

// fetch  filename
exports.fetchName = function(str) {
    return str.substr(str.lastIndexOf('/') + 1);
};

// format songs 
exports.format = function(list) {
    var songs = [];
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