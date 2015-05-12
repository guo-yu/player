import path from 'path'
import Player from '../dist/player'

export default function() {
  var command = process.argv[2]
  if (!command)
    return

  var songs = process.argv.splice(3)
  if (!songs || songs.length === 0)
    return

  var player = new Player(format(songs))

  try {
    player[command]()
  } catch (err) {
    console.log(err)
  }

  function format(songs) {
    return songs.map((songPath) => {
      if (isAbs(songPath))
        return songPath

      return path.join(process.cwd(), songPath)
    })
  }

  function isAbs(str) {
    if (str.indexOf('http') === 0 || str.indexOf('https') === 0)
      return true

    var beginWith = str.charAt(0)
    if (beginWith === '~' || beginWith == '/')
      return true

    return false
  }
}
