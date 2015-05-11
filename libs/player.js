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
import http from 'http'
import https from 'https'
import home from 'home'
import lame from 'lame'
import async from 'async'
import _ from 'underscore'
import Speaker from 'speaker'
import PoolStream from 'pool_stream'
import { EventEmitter } from "events"
import { fetchName, format, getProgress } from './utils'

const defaults = {
  'src': 'src',
  'cache': false,
  'stream': false,
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
    if (!songs)
      return

    // Inherits eventEmitter
    super()

    this.list = format(songs)
    this.history = []
    this.options = _.extend(defaults, params)

    // Bind events
    this.once('playing', (song) => {
      this.playing = song
      this.history.push(song)
    })
  }
  
  /**
   * [Play a mp3 list]
   * @param  {Function} done     [the callback function when all mp3s play end]
   * @param  {[type]}   selected [the selected mp3 object.]
   */
  play(done, selected) {
    var self = this

    if (done !== 'next')
      this.once('done', _.isFunction(done) ? done : errHandler)

    if (this.list.length <= 0)
      return

    async.eachSeries(
      selected || this.list, 
      startPlay, 
      (err) => this.emit('done', err)
    )

    return this

    function startPlay(song, callback) {
      var url = _.isString(song) ?
        song :
        song[self.options.src]

      self.read(url, onPlay)

      function onPlay(err, pool) {
        if (err)
          return callback(err)

        pool
          .pipe(new lame.Decoder())
          .once('format', onPlaying)
          .once('finish', onFinished)

        function onPlaying(f) {
          var speaker = new Speaker(f)

          self.speaker = {};
          self.speaker.readableStream = this
          self.speaker.Speaker = speaker
          self.emit('playing', song)

          try {
            self.show(song, require('musicmetadata'))
          } catch (err) {}

          // This is where the song acturaly played end,
          // can't trigger playend event here cause
          // unpipe will fire this speaker's close event.
          this.pipe(speaker)
            .once('close', () => self.emit('stopped', song))
        }

        function onFinished() {
          self.list = self.list.filter((i) => i['_id'] != song._id)
          self.emit('playend', song)

          // Switch to next one
          callback(null)
        }
      }
    }

    function errHandler(err) {
      if (err) 
        throw err

      return
    }

  }

  /**
   * [Read mp3 src and check if we're going to download it.]
   * @param  {String}   src    [mp3 file src, would be local path or URI (http/https)]
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
   * if there is no next song, callback with a `No next` Error object.]
   * @param  {Function} callback [callback with err and next song.]
   * @return {Bool}
   */
  next(callback) {
    var list = this.list;
    var current = this.history[this.history.length - 1];
    var next = list[current._id + 1];
    var isCallback = callback && _.isFunction(callback);

    if (!next) {
      if (isCallback)
        return callback(new Error('No next'))

      return
    }

    this.stop()
    this.play('next', list.slice(next._id))

    return isCallback ? callback(null, next, current) : true
  }

  /**
   * [Add a new song to the playlist,
   * If provided `song` is a String, it will be converted to a `Song` Object.]
   * @param {String|Object} song [src URI of new song or the object of new song.]
   */
  add(song) {
    if (!this.list)
      this.list = []

    var latest = _.isObject(song) ? song : {}

    latest._id = this.list.length

    if (_.isString(song))
      latest.src = song

    this.list.push(latest)
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

  /**
   * [Lists songs in the playlist,
   * Displays the src for each song returned in JSON]
   */
  playList() {
    if (!this.list)
      return

    return JSON.stringify(
      this.list.map((el) => el['src'])
    )
  }

  show(song, mm) {
    var total = 70
    var name = song['src'].split('/').pop()
    var options = {
      'duration': true
    }
    
    try {
      (mm || require('musicmetadata'))(fs.createReadStream(name), options, showMeta)

      function showMeta(err, metadata) {
        if (err) {
          console.log(`Now playing: ${name} (No metadata found)`);
          return
        }

        var info = metadata.title
        var duration = parseInt(metadata.duration)
        var dots = total - 1
        var speed = (duration * 1000) / total

        async.doWhilst(
          (callback) => {
            // Doesn't work sometimes on mac
            // process.stdout.clearLine()

            // Clear console
            process.stdout.write('\0o33c')

            // Move cursor to beginning of line
            process.stdout.cursorTo(0)
            process.stdout.write(getProgress(total - dots, total, info))

            setTimeout(callback, speed)

            dots--
          },
          () => dots > 0,
          (done) => {
            process.stdout.moveCursor(0, -1)
            process.stdout.clearLine()
            process.stdout.cursorTo(0)
          }
        )
      }
    } catch (err) {
      console.log(err)
    }
  }
}
