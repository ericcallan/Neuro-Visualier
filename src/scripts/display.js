export default class Display {
  constructor (auto = true) {
    // class bindings
    this.initCanvas = this.initCanvas.bind(this)
    this.resizeCanvas = this.resizeCanvas.bind(this)
    this.dot = this.dot.bind(this)
    this.loadCanvas = this.loadCanvas.bind(this)
    this.moveCircles = this.moveCircles.bind(this)
    this.endExperience = this.endExperience.bind(this)

    this.timer = 0

    // class level vars
    this.canvas = document.getElementById('app')
    this.context = this.canvas.getContext('2d')
    this.circles = []
    this.count = 0

    this.r = 255
    this.g = 255
    this.b = 255

    this.increaseR = true
    this.increaseG = true
    this.increaseB = true

    // sound class vars
    this.frame = null
    this.frequencyData = null

    let AudioContext =
      window.AudioContext || // Default
      window.webkitAudioContext || // Safari and old versions of Chrome
      false

    if (AudioContext) {
      this.audioCtx = new AudioContext()
    } else {
      // Web Audio API is not supported
      // Alert the user
      alert(
        'Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox'
      )
    }

    this.audioBuffer
    this.sourceNode
    this.canvas

    // brain or audio controlled color and waves
    this.auto = auto
    this.average = 0

    this.relative = {
      alpha: 0,
      delta: 0,
      beta: 0,
      gamma: 0,
      theta: 0
    }

    this.socket = io()
  }

  start (state) {
    this.initCanvas()

    // brain powered v. music visualizer
    if (this.auto == false) {
      this.listen()
    }

    this.audioFile = this.getRandomSong()

    if (state == 'relax') {
      this.audioFile = './sounds/Alpha_110.mp3'
      this.wave = 'alpha'

      // basic color and initial values
      this.r = 255
      this.g = 255
      this.b = 255
    } else if (state == 'focus') {
      this.audioFile = './sounds/Beta_125.mp3'
      this.wave = 'beta'

      this.r = 255
      this.g = 255
      this.b = 255
    } else {
      this.audioFile = this.getRandomSong()
    }

    // set her off
    this.loadAudio()

    setTimeout(this.endExperience, 240000)
  }

  getRandomSong (song = false) {
    if (song) {
      return song
    }

    let songs = [
      './audio/king2.mp3',
    ]

    return songs[Math.floor(Math.random() * songs.length)]
  }

  initCanvas () {
    window.addEventListener('resize', this.resizeCanvas, false)
    this.resizeCanvas()
  }

  resizeCanvas () {
    // this.canvas.width = window.innerHeight;
    // this.canvas.height = window.innerHeight;

    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.loadCanvas()
  }

  loadCanvas () {
    // create base dot on canvas and set off elipse creation
    if (this.auto) {
      this.dot(
        this.getNextColor(),
        this.getRandomInt(0, this.canvas.width),
        this.getRandomInt(0, this.canvas.height),
        this.getRandomInt(0, 15)
      )
    } else {
      this.dot(
        this.getColor(),
        this.getRandomInt(0, this.canvas.width),
        this.getRandomInt(0, this.canvas.height),
        this.getRandomInt(0, 15)
      )
    }

    this.moveCircles()
  }

  moveCircles () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    let vol = Math.round(100 - this.average / 5)

    for (let i = 0; i < this.circles.length; i++) {
      // if circles are off screen remove them from the array
      if (
        this.circles[i]['radius'] * 2 >
        this.canvas.width + this.canvas.width * 2
      ) {
        this.circles.shift()
      }

      this.context.beginPath()
      this.context.arc(
        this.canvas.width / 2,
        this.canvas.height / 2,
        this.circles[i]['radius'] * vol / 100,
        0,
        2 * Math.PI,
        false
      )
      // this.context.arc(this.canvas.width / 2, this.canvas.height / 2, this.circles[i]['radius'], 0, 2 * Math.PI, false);
      this.context.fillStyle = this.circles[i]['color']
      this.context.fill()
      this.context.lineWidth = 1

      this.circles[i]['radius']++
    }

    if (vol <= 0) {
      vol = 1
    }

    if (this.count % (vol / 2) == 0) {
      if (this.auto) {
        this.dot(this.getNextColor())
      } else {
        this.dot(this.getColor())
      }
    }

    this.count++
    requestAnimationFrame(this.moveCircles)
  }

  dot (color = '', x = 0, y = 0, radius = 0, opacity = 1) {
    let current = []
    current['color'] = color
    current['x'] = x
    current['y'] = y
    current['radius'] = radius
    current['opacity'] = opacity

    this.circles.push(current)
  }

  getRandomColor () {
    var letters = '0123456789ABCDEF'
    var color = '#'

    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }

    return color
  }

  getColor () {
    return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ', .5)'
  }

  getNextColor () {
    if (this.increaseR == true) {
      if (this.r >= 255) {
        this.increaseR = false
      } else {
        this.r += this.getRandomInt(0, 50)
      }
      // add to the R value
    } else {
      // subtract from the R value
      if (this.r <= 0) {
        this.increaseR = true
      } else {
        this.r -= this.getRandomInt(0, 50)
      }
    }

    if (this.increaseG == true) {
      if (this.g >= 255) {
        this.increaseG = false
      } else {
        this.g += this.getRandomInt(0, 50)
      }
      // add to the R value
    } else {
      // subtract from the R value
      if (this.g <= 0) {
        this.increaseG = true
      } else {
        this.g -= this.getRandomInt(0, 50)
      }
    }

    if (this.increaseB == true) {
      if (this.b >= 255) {
        this.increaseB = false
      } else {
        this.b += this.getRandomInt(0, 50)
      }
      // add to the R value
    } else {
      // subtract from the R value
      if (this.b <= 0) {
        this.increaseB = true
      } else {
        this.b -= this.getRandomInt(0, 50)
      }
    }

    return (
      'rgba(' +
      this.r +
      ',' +
      this.g +
      ',' +
      this.b +
      ', ' +
      this.getRandomInt(1, 100) / 100 +
      ')'
    )
  }

  getRandomInt (min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)

    return Math.floor(Math.random() * (max - min)) + min
  }

  endExperience () {
    this.socket.close()
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.sourceNode.stop()

    $('.end').addClass('active')
  }

  listen () {
    let cur = 0
    let percent = 0

    // generates relative data from headset
    // relative = cur absolute / sum(all absolutes)
    this.socket.on('message', msg => {
      console.log('message')
      console.log('recening')
      let data = JSON.parse(msg)
      let current = data.address.substr(data.address.lastIndexOf('/') + 1)
      current = current.substring(0, current.indexOf('_'))

      this.relative[current] = Math.pow(10, data.args[0])

      cur =
        this.relative[current] /
        Object.values(this.relative).reduce((a, b) => a + b)
      percent = Math.round(cur * 100)

      if (percent < 0) {
        percent = 0
      }

      if (percent > 100) {
        percent = 100
      }

      if (current == 'alpha' && this.wave == 'alpha') {
        // relaxed - blue
        let adjusted = percent * 2 * 255 / 100

        this.r = Math.round(adjusted)
        this.g = Math.round(adjusted)
        this.b = Math.round(adjusted * 2)
      } else if (current == 'beta' && this.wave == 'beta') {
        // focus
        let adjusted = percent * 2 * 255 / 100

        this.r = Math.round(adjusted * 2)
        this.g = Math.round(adjusted)
        this.b = Math.round(adjusted)
      }
    })
  }

  loadAudio () {
    this.setupAudioNodes(this.sourceNode, this.audioCtx)
    this.playSound(this.audioFile, this.audioCtx)
  }

  setupAudioNodes (sourceNode, context) {
    this.sourceNode = context.createBufferSource()
    this.sourceNode.connect(context.destination)
    let average = 0

    let javascriptNode = context.createScriptProcessor(2048, 1, 1)
    javascriptNode.connect(context.destination)

    let analyser = context.createAnalyser()
    analyser.smoothingTimeConstant = 0.3
    analyser.fftSize = 1024

    // create a buffer source node
    this.sourceNode = context.createBufferSource()
    this.sourceNode.connect(analyser)

    analyser.connect(javascriptNode)
    this.sourceNode.connect(context.destination)

    javascriptNode.onaudioprocess = () => {
      let array = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(array)

      this.average = this.getAverageVolume(array)
    }
  }

  getAverageVolume (array) {
    var values = 0
    var average
    var length = array.length

    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
      values += array[i]
    }

    average = values / length
    return average
  }

  playSound (url, context, sourceNode) {
    var request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'

    let that = this
    // When loaded decode the data
    request.onload = () => {
      // decode the data
      context.decodeAudioData(request.response, function (buffer) {
        // when the audio is decoded play the sound
        that.sourceNode.buffer = buffer
        that.sourceNode.start(0)
      })
    }

    request.send()
  }
}
