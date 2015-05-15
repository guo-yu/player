export function fetchName(str) {
  var filename = str.substr(str.lastIndexOf('/') + 1)

  // Escape URI like this: `http://domain.com/xxx.mp3?xcode=fasda`
  if (filename.indexOf('?') !== -1) {
    var parts = filename.split('?')
    filename = parts[0]
  }

  return filename
}

export function format(list, srcKey) {
  var songs = []

  if (typeof(list) === 'string') {
    songs.push({
      [ srcKey ]: list,
      '_id': 0,
      '_name': splitName(list),
    })

    return songs
  }

  list.forEach((item, index) => {
    // If `songs` is a Map
    if (typeof(item) === 'object') {
      item._id = index

      if (item[srcKey])
        item._name = splitName(item[srcKey])

      songs.push(item)
      return
    }

    // If `songs` is a Array
    songs.push({
      [ srcKey ]: item,
      '_id': index,
      '_name': splitName(item)
    })
  })

  return songs
}

export function chooseRandom(arr) {
  if (!arr || !arr.length)
    return 0

  let min = 0
  let max = arr.length - 1

  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getProgress(p, t, info) {
  var bar = ''
  bar += ('Now playing: ' + info)
  bar += '\n['

  for (var i = 0; i < p; i++)
    bar += '>'

  for (var i = p; i < t - 1; i++)
    bar += ' '

  bar += ']'

  return bar
}

export function splitName(str) {
  return str.split('/').pop()
}
