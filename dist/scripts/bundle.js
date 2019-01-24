(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Display = function () {
  function Display() {
    var auto = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    _classCallCheck(this, Display);

    // class bindings
    this.initCanvas = this.initCanvas.bind(this);
    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.dot = this.dot.bind(this);
    this.loadCanvas = this.loadCanvas.bind(this);
    this.moveCircles = this.moveCircles.bind(this);
    this.endExperience = this.endExperience.bind(this);

    this.timer = 0;

    // class level vars
    this.canvas = document.getElementById('app');
    this.context = this.canvas.getContext('2d');
    this.circles = [];
    this.count = 0;

    this.r = 255;
    this.g = 255;
    this.b = 255;

    this.increaseR = true;
    this.increaseG = true;
    this.increaseB = true;

    // sound class vars
    this.frame = null;
    this.frequencyData = null;

    var AudioContext = window.AudioContext || // Default
    window.webkitAudioContext || // Safari and old versions of Chrome
    false;

    if (AudioContext) {
      this.audioCtx = new AudioContext();
    } else {
      // Web Audio API is not supported
      // Alert the user
      alert('Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox');
    }

    this.audioBuffer;
    this.sourceNode;
    this.canvas;

    // brain or audio controlled color and waves
    this.auto = auto;
    this.average = 0;

    this.relative = {
      alpha: 0,
      delta: 0,
      beta: 0,
      gamma: 0,
      theta: 0
    };

    this.socket = io();
  }

  _createClass(Display, [{
    key: 'start',
    value: function start(state) {
      this.initCanvas();

      // brain powered v. music visualizer
      if (this.auto == false) {
        this.listen();
      }

      this.audioFile = this.getRandomSong();

      if (state == 'relax') {
        this.audioFile = './sounds/Alpha_110.mp3';
        this.wave = 'alpha';

        // basic color and initial values
        this.r = 255;
        this.g = 255;
        this.b = 255;
      } else if (state == 'focus') {
        this.audioFile = './sounds/Beta_125.mp3';
        this.wave = 'beta';

        this.r = 255;
        this.g = 255;
        this.b = 255;
      } else {
        this.audioFile = this.getRandomSong();
      }

      // set her off
      this.loadAudio();

      setTimeout(this.endExperience, 240000);
    }
  }, {
    key: 'getRandomSong',
    value: function getRandomSong() {
      var song = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (song) {
        return song;
      }

      var songs = ['./audio/king2.mp3'];

      return songs[Math.floor(Math.random() * songs.length)];
    }
  }, {
    key: 'initCanvas',
    value: function initCanvas() {
      window.addEventListener('resize', this.resizeCanvas, false);
      this.resizeCanvas();
    }
  }, {
    key: 'resizeCanvas',
    value: function resizeCanvas() {
      // this.canvas.width = window.innerHeight;
      // this.canvas.height = window.innerHeight;

      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.loadCanvas();
    }
  }, {
    key: 'loadCanvas',
    value: function loadCanvas() {
      // create base dot on canvas and set off elipse creation
      if (this.auto) {
        this.dot(this.getNextColor(), this.getRandomInt(0, this.canvas.width), this.getRandomInt(0, this.canvas.height), this.getRandomInt(0, 15));
      } else {
        this.dot(this.getColor(), this.getRandomInt(0, this.canvas.width), this.getRandomInt(0, this.canvas.height), this.getRandomInt(0, 15));
      }

      this.moveCircles();
    }
  }, {
    key: 'moveCircles',
    value: function moveCircles() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      var vol = Math.round(100 - this.average / 5);

      for (var i = 0; i < this.circles.length; i++) {
        // if circles are off screen remove them from the array
        if (this.circles[i]['radius'] * 2 > this.canvas.width + this.canvas.width * 2) {
          this.circles.shift();
        }

        this.context.beginPath();
        this.context.arc(this.canvas.width / 2, this.canvas.height / 2, this.circles[i]['radius'] * vol / 100, 0, 2 * Math.PI, false);
        // this.context.arc(this.canvas.width / 2, this.canvas.height / 2, this.circles[i]['radius'], 0, 2 * Math.PI, false);
        this.context.fillStyle = this.circles[i]['color'];
        this.context.fill();
        this.context.lineWidth = 1;

        this.circles[i]['radius']++;
      }

      if (vol <= 0) {
        vol = 1;
      }

      if (this.count % (vol / 2) == 0) {
        if (this.auto) {
          this.dot(this.getNextColor());
        } else {
          this.dot(this.getColor());
        }
      }

      this.count++;
      requestAnimationFrame(this.moveCircles);
    }
  }, {
    key: 'dot',
    value: function dot() {
      var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var radius = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var opacity = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;

      var current = [];
      current['color'] = color;
      current['x'] = x;
      current['y'] = y;
      current['radius'] = radius;
      current['opacity'] = opacity;

      this.circles.push(current);
    }
  }, {
    key: 'getRandomColor',
    value: function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';

      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }

      return color;
    }
  }, {
    key: 'getColor',
    value: function getColor() {
      return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ', .5)';
    }
  }, {
    key: 'getNextColor',
    value: function getNextColor() {
      if (this.increaseR == true) {
        if (this.r >= 255) {
          this.increaseR = false;
        } else {
          this.r += this.getRandomInt(0, 50);
        }
        // add to the R value
      } else {
        // subtract from the R value
        if (this.r <= 0) {
          this.increaseR = true;
        } else {
          this.r -= this.getRandomInt(0, 50);
        }
      }

      if (this.increaseG == true) {
        if (this.g >= 255) {
          this.increaseG = false;
        } else {
          this.g += this.getRandomInt(0, 50);
        }
        // add to the R value
      } else {
        // subtract from the R value
        if (this.g <= 0) {
          this.increaseG = true;
        } else {
          this.g -= this.getRandomInt(0, 50);
        }
      }

      if (this.increaseB == true) {
        if (this.b >= 255) {
          this.increaseB = false;
        } else {
          this.b += this.getRandomInt(0, 50);
        }
        // add to the R value
      } else {
        // subtract from the R value
        if (this.b <= 0) {
          this.increaseB = true;
        } else {
          this.b -= this.getRandomInt(0, 50);
        }
      }

      return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ', ' + this.getRandomInt(1, 100) / 100 + ')';
    }
  }, {
    key: 'getRandomInt',
    value: function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);

      return Math.floor(Math.random() * (max - min)) + min;
    }
  }, {
    key: 'endExperience',
    value: function endExperience() {
      this.socket.close();
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.sourceNode.stop();

      $('.end').addClass('active');
    }
  }, {
    key: 'listen',
    value: function listen() {
      var _this = this;

      var cur = 0;
      var percent = 0;

      // generates relative data from headset
      // relative = cur absolute / sum(all absolutes)
      this.socket.on('message', function (msg) {
        console.log('message');
        console.log('recening');
        var data = JSON.parse(msg);
        var current = data.address.substr(data.address.lastIndexOf('/') + 1);
        current = current.substring(0, current.indexOf('_'));

        _this.relative[current] = Math.pow(10, data.args[0]);

        cur = _this.relative[current] / Object.values(_this.relative).reduce(function (a, b) {
          return a + b;
        });
        percent = Math.round(cur * 100);

        if (percent < 0) {
          percent = 0;
        }

        if (percent > 100) {
          percent = 100;
        }

        if (current == 'alpha' && _this.wave == 'alpha') {
          // relaxed - blue
          var adjusted = percent * 2 * 255 / 100;

          _this.r = Math.round(adjusted);
          _this.g = Math.round(adjusted);
          _this.b = Math.round(adjusted * 2);
        } else if (current == 'beta' && _this.wave == 'beta') {
          // focus
          var _adjusted = percent * 2 * 255 / 100;

          _this.r = Math.round(_adjusted * 2);
          _this.g = Math.round(_adjusted);
          _this.b = Math.round(_adjusted);
        }
      });
    }
  }, {
    key: 'loadAudio',
    value: function loadAudio() {
      this.setupAudioNodes(this.sourceNode, this.audioCtx);
      this.playSound(this.audioFile, this.audioCtx);
    }
  }, {
    key: 'setupAudioNodes',
    value: function setupAudioNodes(sourceNode, context) {
      var _this2 = this;

      this.sourceNode = context.createBufferSource();
      this.sourceNode.connect(context.destination);
      var average = 0;

      var javascriptNode = context.createScriptProcessor(2048, 1, 1);
      javascriptNode.connect(context.destination);

      var analyser = context.createAnalyser();
      analyser.smoothingTimeConstant = 0.3;
      analyser.fftSize = 1024;

      // create a buffer source node
      this.sourceNode = context.createBufferSource();
      this.sourceNode.connect(analyser);

      analyser.connect(javascriptNode);
      this.sourceNode.connect(context.destination);

      javascriptNode.onaudioprocess = function () {
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);

        _this2.average = _this2.getAverageVolume(array);
      };
    }
  }, {
    key: 'getAverageVolume',
    value: function getAverageVolume(array) {
      var values = 0;
      var average;
      var length = array.length;

      // get all the frequency amplitudes
      for (var i = 0; i < length; i++) {
        values += array[i];
      }

      average = values / length;
      return average;
    }
  }, {
    key: 'playSound',
    value: function playSound(url, context, sourceNode) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      var that = this;
      // When loaded decode the data
      request.onload = function () {
        // decode the data
        context.decodeAudioData(request.response, function (buffer) {
          // when the audio is decoded play the sound
          that.sourceNode.buffer = buffer;
          that.sourceNode.start(0);
        });
      };

      request.send();
    }
  }]);

  return Display;
}();

exports.default = Display;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Gradient = function () {
  function Gradient() {
    _classCallCheck(this, Gradient);

    this.colors = new Array([62, 35, 255], [60, 255, 60], [255, 35, 98], [45, 175, 230], [255, 0, 255], [255, 128, 0]);

    this.step = 0;

    this.colorIndices = [0, 1, 2, 3];

    this.gradientSpeed = 0.0009;

    this.updateGradient = this.updateGradient.bind(this);
    setInterval(this.updateGradient, 0.1);
  }

  _createClass(Gradient, [{
    key: 'updateGradient',
    value: function updateGradient() {
      var c0_0 = this.colors[this.colorIndices[0]];
      var c0_1 = this.colors[this.colorIndices[1]];
      var c1_0 = this.colors[this.colorIndices[2]];
      var c1_1 = this.colors[this.colorIndices[3]];

      var istep = 1 - this.step;
      var r1 = Math.round(istep * c0_0[0] + this.step * c0_1[0]);
      var g1 = Math.round(istep * c0_0[1] + this.step * c0_1[1]);
      var b1 = Math.round(istep * c0_0[2] + this.step * c0_1[2]);
      var color1 = 'rgb(' + r1 + ',' + g1 + ',' + b1 + ')';

      var r2 = Math.round(istep * c1_0[0] + this.step * c1_1[0]);
      var g2 = Math.round(istep * c1_0[1] + this.step * c1_1[1]);
      var b2 = Math.round(istep * c1_0[2] + this.step * c1_1[2]);
      var color2 = 'rgb(' + r2 + ',' + g2 + ',' + b2 + ')';

      $('#gradient').css({
        background: '-webkit-radial-gradient(' + color1 + ',' + color2 + ')'
      });

      this.step += this.gradientSpeed;

      if (this.step >= 1) {
        this.step %= 1;
        this.colorIndices[0] = this.colorIndices[1];
        this.colorIndices[2] = this.colorIndices[3];

        this.colorIndices[1] = (this.colorIndices[1] + Math.floor(1 + Math.random() * (this.colors.length - 1))) % this.colors.length;
        this.colorIndices[3] = (this.colorIndices[3] + Math.floor(1 + Math.random() * (this.colors.length - 1))) % this.colors.length;
      }
    }
  }]);

  return Gradient;
}();

exports.default = Gradient;

},{}],3:[function(require,module,exports){
'use strict';

var _display = require('./display');

var _display2 = _interopRequireDefault(_display);

var _gradient = require('./gradient');

var _gradient2 = _interopRequireDefault(_gradient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var gradient = new _gradient2.default();
var state = 'focus';

$('#home').on('click', function () {
  $('#home').addClass('hide');
  $('#about').removeClass('no-display');
  $('.overlay').addClass('active');

  setTimeout(function () {
    $('#home').addClass('no-display');
    $('#about').removeClass('hide');
  }, 1000);
});

$('section').on('click', 'button', function () {
  var cur = $(this).closest('section');
  var next = $(this).closest('section').next('section');

  nextSection(cur, next);
});

$('#choice button').on('click', function () {
  state = $(this).data('state');
  $('.help-' + state).addClass('active');
});

function nextSection(cur, next) {
  cur.addClass('hide');
  next.removeClass('no-display');

  setTimeout(function () {
    cur.addClass('no-display');
    next.removeClass('hide');

    if (next.attr('id') == 'start') {
      setTimeout(function () {
        nextSection(next, next.closest('section').next('section'));

        var display = null;

        if (state == 'music') {
          display = new _display2.default(true);
        } else {
          display = new _display2.default(false);
        }

        setTimeout(function () {
          display.start(state);
        }, 1000);
      }, 5000);
    }
  }, 500);
}

},{"./display":1,"./gradient":2}]},{},[3]);
