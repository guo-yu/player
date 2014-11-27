exports.format = format;
exports.fetchName = fetchName;

// Fetch filename
function fetchName(str) {
  var filename = str.substr(str.lastIndexOf('/') + 1);
  // Escape URI like this: `http://domain.com/xxx.mp3?xcode=fasda`
  if (filename.indexOf('?') !== -1) {
    var parts = filename.split('?');
    filename = parts[0];
  }
  return filename;
}

// Format songs 
function format(list) {
  var songs = [];

  if (typeof(list) === 'string') {
    songs.push({
      src: list,
      _id: 0
    });
    return songs;
  }

  list.forEach(function(item, index) {
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
}
