export function fetchName(str) {
  var filename = str.substr(str.lastIndexOf('/') + 1)

  // Escape URI like this: `http://domain.com/xxx.mp3?xcode=fasda`
  if (filename.indexOf('?') !== -1) {
    var parts = filename.split('?')
    filename = parts[0]
  }

  return filename
}

export function format(list) {
  var songs = []

  if (typeof(list) === 'string') {
    songs.push({
      src: list,
      _id: 0,
      _name: fetchName(list),
    })

    return songs
  }

  list.forEach((item, index) => {
    // If `songs` is a Map
    if (typeof(item) === 'object') {
      item._id = index

      if (item.src)
        item._name = fetchName(item.src)

      songs.push(item)
      return
    }

    // If `songs` is a Array
    songs.push({
      src: item,
      _id: index,
      _name: fetchName(item)
    })
  })

  return songs
}

export function getProgress(p, t, info) {
  var bar = ''
  bar += ('Now playing: ' + info)
  bar += '\n'

  for (var i = 0; i < p; i++)
    bar += '>'

  for (var i = p; i < t - 1; i++)
    bar += ' '

  bar += '|'

  return bar
}

function fetchName(str) {
  return str.split('/').pop()
}
