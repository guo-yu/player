import path from 'path'
import keypress from 'keypress'
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

  keypress(process.stdin);

  process.stdin.on('keypress', function (ch, key) {
    if (key && key.ctrl && key.name == 'c') {
      process.exit(0)
    }
    if (key && key.name == 'space') {
      player.pause()
    }
    if (key && key.name == 'x') {
      player.stop()
    }
    if (key && key.name == 's') {
      player.play()
    }
  });

  process.stdin.setRawMode(true)
  process.stdin.resume()

  console.log('press "x" to stop, press "s" to play, press "space" to pause / resume')
}
