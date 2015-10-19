/**
*
* Command line interface mp3 player based on Node.js
* @Author:   [turingou](http://guoyu.me)
* @Created:  [2013/07/20]
*
**/

import fs from 'fs'
import path from 'path'
import util from "util"
import { http, https } from 'follow-redirects'
import home from 'home'
import lame from 'lame'
import _ from 'underscore'
import Speaker from 'speaker'
import PoolStream from 'pool_stream'
import Volume from 'pcm-volume'
import { EventEmitter } from "events"
import { fetchName, splitName, format, getProgress, chooseRandom } from './utils'

const defaults = {
  'src': 'src',
  'cache': false,
  'stream': false,
  'shuffle': false,
  'downloads': home(),
  'http_proxy': process.env.HTTP_PROXY || process.env.http_proxy || null,
}

/**
 * [Class Player]
 * @param {Array|String} songs  [A list of songs or a single song URI string.]
 * @param {Object}       params [Optional options when init a instance]
 */
export default class Player extends EventEmitter {
  constructor(songs, params) {
//    if (!songs)
//      return

    // Inherits eventEmitter
    super()

    this.history = []
    this.paused = false
    this.options = _.extend(defaults, params)
    this._list = format(songs || [], this.options.src)
    if (!this._list || !this._list.length) this._list = []
  }

  // Enable or disable a option
  enable(k) {
    this.options[k] = true
    return this
  }

  disable(k) {
    this.options[k] = false
    return this
  }

  /**
   * [Lists songs in the playlist,
   * Displays the src for each song returned in array,
   * Access with prop `player.list`]
   */
  get list() {
    if (!this._list)
      return

    return this._list.map(el => el[this.options.src])
  }

  // Get the lastest playing song
  get playing() {
    if (!this.history.length)
      return null

    return this._list[this.history[this.history.length - 1]]
  }

  /**
   * [Play a MP3 encoded audio file]
   * @param  {Number} index [the selected index of first played song]
   */
  play(index = 0) {
    if (this._list.length <= 0)
      return
    if (!_.isNumber(index))
      index = 0
    if (index >= this._list.length) index = this._list.length - 1;

    let self = this
    let song = this._list[index]

    this.paused = false
    this.read(song[this.options.src], (err, pool) => {
      if (err)
        return this.emit('error', err)

      this.meta(pool, (err, data) => {
        if (!err) 
          song.meta = data
      })

      this.lameStream = new lame.Decoder()

      pool
        .pipe(this.lameStream)
        .once('format', onPlaying)
        .once('finish', () => this.next())

      function onPlaying(f) {
        self.lameFormat = f
        var speaker = new Volume()
        speaker.pipe(new Speaker(self.lameFormat))

        self.speaker = {
          'readableStream': this,
          'Speaker': speaker,
        }

        self.emit('playing', song)
        self.history.push(index)

        // This is where the song acturaly played end,
        // can't trigger playend event here cause
        // unpipe will fire this speaker's close event.
        this.pipe(speaker)
          .once('close', () => 
            self.emit('playend', song))
      }
    })

    return this
  }

  /**
   * [Set playback volume]
   * @param  {Number}   volume   [Volume level percentage 0.0-1.0]
   */
   setVolume(volume) {
       if(!this.speaker)
           return;

       this.speaker.Speaker.setVolume(volume);
   }

  /**
   * [Read MP3 src and check if we're going to download it.]
   * @param  {String}   src      [MP3 file src, would be local path or URI (http/https)]
   * @param  {Function} callback [callback with err and file stream]
   */
  read(src, callback) {
    var isLocal = !(src.indexOf('http') == 0 || src.indexOf('https') == 0)

    // Read local file stream if not a valid URI
    if (isLocal)
      return callback(null, fs.createReadStream(src))

    var file = path.join(
      this.options.downloads,
      fetchName(src)
    )

    if (fs.existsSync(file))
      return callback(null, fs.createReadStream(file))

    this.download(src, callback)
  }

  /**
   * [Pause or resume audio]
   * @return {player} this
   */
  pause() {
    if (this.paused) {
      this.speaker.Speaker = new Volume()
      this.speaker.Speaker.pipe(new Speaker(this.lameFormat))

      this.lameStream.pipe(this.speaker.Speaker)
    } else {
      this.speaker.Speaker.end()
    }

    this.paused = !this.paused
    return this	
  }

  /**
   * [Stop playing and unpipe stream.
   * No params for now.]
   * @return {Bool} [always `false`]
   */
  stop() {
    if (!this.speaker)
      return

    this.speaker
      .readableStream
      .unpipe()

    this.speaker
      .Speaker
      .end()

    return
  }

  /**
   * [Stop playing and switch to next song,
   * if there is no next song, trigger a `No next song` error event]
   * @return {player} this
   */
  next() {
    let list = this._list
    let current = this.playing
    let nextIndex = this.options.shuffle ? 
      chooseRandom(_.difference(list, [current._id])) :
      current._id + 1

    if (nextIndex >= list.length) {
      this.emit('error', 'No next song was found')
      this.emit('finish', current)
      return this
    }

    this.stop()
    this.play(nextIndex)

    return this
  }

  /**
   * [Add a new song to the playlist,
   * If provided `song` is a String, it will be converted to a `Song` Object.]
   * @param {String|Object} song [src URI of new song or the object of new song.]
   */
  add(song) {
    var latest = _.isObject(song) ? song : {}

    latest._id = this._list.length

    if (_.isString(song)) {
      latest._name = splitName(song)
      latest[this.options.src] = song
    }

    this._list.push(latest)
  }

  /**
   * [Download a mp3 file from its URI]
   * @param  {String}   src      [the src URI of mp3 file]
   * @param  {Function} callback [callback with err and file stream]
   */
  download(src, callback) {
    var self = this
    var called = false
    var proxyReg = /http:\/\/((?:\d{1,3}\.){3}\d{1,3}):(\d+)/
    var http_proxy = self.options.http_proxy
    var request = src.indexOf('https') === 0 ? https : http
    var query = src

    if (http_proxy && proxyReg.test(http_proxy)) {
      var proxyGroup = http_proxy.match(proxyReg)
      query = {}
      query.path = src
      query.host = proxyGroup[1]
      query.port = proxyGroup[2]
    }

    request
      .get(query, responseHandler)
      .once('error', errorHandler)

    function responseHandler(res) {
      called = true

      var isOk = (res.statusCode === 200)
      var isAudio = (res.headers['content-type'].indexOf('audio/mpeg') > -1)
      var isSave = self.options.cache
      var isStream = self.options.stream

      if (!isOk)
        return callback(new Error('Resource invalid'))
      if (isStream)
        return callback(null, res)
      if (!isAudio)
        return callback(new Error('Resource type is unsupported'))

      // Create a pool
      var pool = new PoolStream()
      // Pipe into memory
      res.pipe(pool)

      // Check if we're going to save this stream
      if (!isSave)
        return callback(null, pool)

      // Save this stream as file in download directory
      var file = path.join(
        self.options.downloads,
        fetchName(src)
      )

      self.emit('downloading', src)
      pool.pipe(fs.createWriteStream(file))

      // Callback the pool
      callback(null, pool)
    }

    function errorHandler(err) {
      if (!called)
        callback(err)
    }
  }

  // Fetch metadata from local or remote mp3 stream
  meta(stream, callback) {
    try {
      var mm = require('musicmetadata')
    } catch (err) {
      return callback(err)
    }

    var options = {
      'duration': true
    }

    stream.on('error', err => 
      this.emit('error', `出错了 ${err.code}: ${err.path}`))

    return mm(stream, options, callback)
  }

  // Format metadata with template 
  // And output to `stdout`
  progress(metadata) {
    var total = 70
    var info = metadata.title
    var duration = parseInt(metadata.duration)
    var dots = total - 1
    var speed = (duration * 1000) / total
    var stdout = process.stdout

    require('async').doWhilst(
      (callback) => {
        // Clear console
        stdout.write('\u001B[2J\u001B[0;0f')

        // Move cursor to beginning of line
        stdout.cursorTo(0)
        stdout.write(getProgress(total - dots, total, info))

        setTimeout(callback, speed)

        dots--
      },
      () => dots > 0,
      (done) => {
        stdout.moveCursor(0, -1)
        stdout.clearLine()
        stdout.cursorTo(0)
      }
    )
  }
}
