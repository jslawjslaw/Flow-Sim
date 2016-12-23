/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _grid = __webpack_require__(1);
	
	var _grid2 = _interopRequireDefault(_grid);
	
	var _view = __webpack_require__(8);
	
	var _view2 = _interopRequireDefault(_view);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	$(function () {
	  var canvasEl = $("#canvas")[0];
	  var angle = $("#range")[0];
	  canvasEl.width = 500;
	  canvasEl.height = 500;
	
	  var ctx = canvasEl.getContext("2d");
	
	  var grid = new _grid2.default(ctx, angle);
	  debugger;
	  grid.draw();
	
	  $("#animate").click(function () {
	    return animate(grid, ctx);
	  });
	  $("#input-range").click(function (e) {
	    return updateAngle(e, grid);
	  });
	});
	
	function animate(grid, ctx) {
	  new _view2.default(grid, ctx).start();
	}
	
	function updateAngle(e, grid) {
	  $("#range-value").html(e.currentTarget.value);
	  grid.airfoil.updateAngle(parseInt(e.currentTarget.value));
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _airfoil = __webpack_require__(2);
	
	var _airfoil2 = _interopRequireDefault(_airfoil);
	
	var _particle = __webpack_require__(6);
	
	var _particle2 = _interopRequireDefault(_particle);
	
	var _mesh = __webpack_require__(7);
	
	var _mesh2 = _interopRequireDefault(_mesh);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Grid = function () {
	  function Grid(ctx, angle) {
	    _classCallCheck(this, Grid);
	
	    this.particles = [];
	    this.ctx = ctx;
	    this.airfoil = new _airfoil2.default(ctx, angle);
	    this.removeQueue = [];
	  }
	
	  _createClass(Grid, [{
	    key: 'addParticles',
	    value: function addParticles() {
	      for (var i = 0; i < 100; i++) {
	        this.particles.push(new _particle2.default({ grid: this, x: 500, y: 250 * Math.random() + 100 }));
	      }
	    }
	  }, {
	    key: 'outOfBounds',
	    value: function outOfBounds(x, y) {
	      return x < 0 || x > 500 || y < 0 || y > 500;
	    }
	  }, {
	    key: 'draw',
	    value: function draw(ctx) {
	      var _this = this;
	
	      this.airfoil.draw();
	      this.mesh = new _mesh2.default(this.airfoil.coords, this.ctx);
	      this.mesh.draw();
	      this.particles.forEach(function (particle) {
	        particle.draw(_this.ctx);
	      });
	    }
	  }, {
	    key: 'step',
	    value: function step(dt) {
	      this.moveParticles(dt);
	    }
	  }, {
	    key: 'moveParticles',
	    value: function moveParticles(dt) {
	      this.particles.forEach(function (particle, idx) {
	        particle.move(dt, idx);
	      });
	
	      this.clearRemoveQueue();
	    }
	  }, {
	    key: 'addToRemoveQueue',
	    value: function addToRemoveQueue(idx) {
	      this.removeQueue.push(idx);
	    }
	  }, {
	    key: 'clearRemoveQueue',
	    value: function clearRemoveQueue(idx) {
	      for (var i = this.removeQueue.length - 1; i >= 0; i--) {
	        this.particles.splice(this.removeQueue[i], 1);
	      }
	
	      this.removeQueue = [];
	    }
	  }]);
	
	  return Grid;
	}();
	
	exports.default = Grid;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _NACA = __webpack_require__(3);
	
	var _NACA2 = _interopRequireDefault(_NACA);
	
	var _NACA3 = __webpack_require__(4);
	
	var _NACA4 = _interopRequireDefault(_NACA3);
	
	var _math = __webpack_require__(5);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Airfoil = function () {
	  function Airfoil(ctx) {
	    var aAttack = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	
	    _classCallCheck(this, Airfoil);
	
	    this.ctx = ctx;
	    this.aAttack = (0, _math.degToRads)(aAttack);
	  }
	
	  _createClass(Airfoil, [{
	    key: 'calcCoords',
	    value: function calcCoords() {
	      var _this = this;
	
	      var x_sum = 0;
	      var y_sum = 0;
	      this.coords = _NACA2.default.map(function (point) {
	        var p = (0, _math.multiply)((0, _math.rotation)(Math.PI), point);
	        var x_coor = 300 * p[0] + 400;
	        var y_coor = 300 * p[1] + 250;
	        x_sum += x_coor;
	        y_sum += y_coor;
	
	        return [x_coor, y_coor];
	      });
	
	      this.centroid = [x_sum / this.coords.length, y_sum / this.coords.length];
	
	      this.coords = (0, _math.subtract)(this.coords, this.centroid);
	      this.coords = this.coords.map(function (point) {
	        return (0, _math.multiply)((0, _math.rotation)(_this.aAttack), point);
	      });
	
	      this.coords = (0, _math.add)(this.coords, this.centroid);
	    }
	  }, {
	    key: 'draw',
	    value: function draw() {
	      this.calcCoords();
	      this.ctx.beginPath();
	      this.ctx.fillStyle = 'black';
	      this.ctx.moveTo(this.coords[0][0], this.coords[0][1]);
	      for (var i = 1; i < this.coords.length; i++) {
	        this.ctx.lineTo(this.coords[i][0], this.coords[i][1]);
	      }
	      this.ctx.fill();
	      this.ctx.closePath();
	    }
	  }, {
	    key: 'updateAngle',
	    value: function updateAngle(aAttack) {
	      this.ctx.clearRect(0, 0, 500, 500);
	      this.aAttack = (0, _math.degToRads)(aAttack);
	      this.draw();
	    }
	  }]);
	
	  return Airfoil;
	}();
	
	exports.default = Airfoil;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	var NACA2412 = [[1.0000, 0.0013], [0.9500, 0.0114], [0.9000, 0.0208], [0.8000, 0.0375], [0.7000, 0.0518], [0.6000, 0.0636], [0.5000, 0.0724], [0.4000, 0.0780], [0.3000, 0.0788], [0.2500, 0.0767], [0.2000, 0.0726], [0.1500, 0.0661], [0.1000, 0.0563], [0.0750, 0.0496], [0.0500, 0.0413], [0.0250, 0.0299], [0.0125, 0.0215], [0.0000, 0.0000], [0.0125, -0.0165], [0.0250, -0.0227], [0.0500, -0.0301], [0.0750, -0.0346], [0.1000, -0.0375], [0.1500, -0.0410], [0.2000, -0.0423], [0.2500, -0.0422], [0.3000, -0.0412], [0.4000, -0.0380], [0.5000, -0.0334], [0.6000, -0.0276], [0.7000, -0.0214], [0.8000, -0.0150], [0.9000, -0.0082], [0.9500, -0.0048], [1.0000, -0.0013]];
	
	module.exports = NACA2412;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	
	var NACA6409 = [[1.00000, 0.00000], [0.99732, 0.00084], [0.98930, 0.00333], [0.97603, 0.00737], [0.95760, 0.01284], [0.93423, 0.01954], [0.90615, 0.02724], [0.87357, 0.03571], [0.83690, 0.04464], [0.79647, 0.05378], [0.75272, 0.06283], [0.70608, 0.07153], [0.65710, 0.07961], [0.60627, 0.08684], [0.55413, 0.09302], [0.50132, 0.09796], [0.44840, 0.10152], [0.39590, 0.10360], [0.34367, 0.10352], [0.29315, 0.10086], [0.24502, 0.09584], [0.19988, 0.08874], [0.15830, 0.07992], [0.12080, 0.06982], [0.08780, 0.05889], [0.05968, 0.04762], [0.03677, 0.03646], [0.01920, 0.02581], [0.00720, 0.01603], [0.00080, 0.00737], [0.00000, 0.00000], [0.00467, 0.00573], [0.01467, 0.00956], [0.02973, 0.01157], [0.04970, 0.01192], [0.07428, 0.01080], [0.10317, 0.00844], [0.13607, 0.00513], [0.17257, 0.00119], [0.21235, 0.00307], [0.25498, 0.00729], [0.30012, 0.01112], [0.34730, 0.01425], [0.39618, 0.01639], [0.44707, 0.01772], [0.49868, 0.01871], [0.55040, 0.01925], [0.60167, 0.01929], [0.65193, 0.01880], [0.70065, 0.01780], [0.74728, 0.01634], [0.79130, 0.01451], [0.83223, 0.01241], [0.86957, 0.01017], [0.90288, 0.00791], [0.93180, 0.00576], [0.95593, 0.00383], [0.97503, 0.00221], [0.98883, 0.00101], [0.99722, 0.00025], [1.00000, 0.00000]];
	
	module.exports = NACA6409;

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	function multiply(A, B) {
	  if (canMultiply(A, B)) {
	    var out = [];
	    for (var i = 0; i < A.length; i++) {
	      var sum = 0;
	      for (var j = 0; j < A[0].length; j++) {
	        sum = sum + A[i][j] * B[j];
	      }
	      out.push(sum);
	    }
	
	    return out;
	  }
	
	  function canMultiply(A, B) {
	    if (A[0].length === B.length) {
	      return true;
	    } else {
	      return false;
	    }
	  }
	}
	
	function rotation(theta) {
	  return [[Math.cos(theta), -1 * Math.sin(theta)], [Math.sin(theta), Math.cos(theta)]];
	}
	
	function subtract(A, B) {
	  var out = [];
	  for (var i = 0; i < A.length; i++) {
	    out.push([A[i][0] - B[0], A[i][1] - B[1]]);
	  }
	
	  return out;
	}
	
	function add(A, B) {
	  var out = [];
	  for (var i = 0; i < A.length; i++) {
	    out.push([A[i][0] + B[0], A[i][1] + B[1]]);
	  }
	
	  return out;
	}
	
	function degToRads(deg) {
	  return deg * Math.PI / 180;
	}
	
	exports.multiply = multiply;
	exports.rotation = rotation;
	exports.subtract = subtract;
	exports.add = add;
	exports.degToRads = degToRads;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Particle = function () {
	  function Particle(options) {
	    _classCallCheck(this, Particle);
	
	    this.x = options.x, this.y = options.y, this.vx = -5, this.vy = 0, this.radius = 2, this.color = 'blue', this.grid = options.grid, this.rho = Math.rand();
	  }
	
	  _createClass(Particle, [{
	    key: 'draw',
	    value: function draw(ctx) {
	      ctx.beginPath();
	      ctx.fillStyle = this.color;
	      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
	      ctx.fill();
	    }
	  }, {
	    key: 'move',
	    value: function move(dt, idx) {
	      var velScale = dt * 60 / 1000;
	      var dx = this.vx * velScale;
	      var dy = this.vy * velScale;
	
	      this.x = this.x + dx;
	      this.y = this.y + dy;
	
	      if (this.grid.outOfBounds(this.x, this.y)) {
	        this.grid.addToRemoveQueue(idx);
	      }
	    }
	  }]);
	
	  return Particle;
	}();
	
	exports.default = Particle;

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Mesh = function () {
	  function Mesh(airfoilCoords, ctx) {
	    _classCallCheck(this, Mesh);
	
	    this.coords = [];
	    this.airfoilCoords = airfoilCoords;
	    this.ctx = ctx;
	    this.rho = [];
	    this.calcCoords();
	
	    this.lx = 500;
	    this.ly = 300;
	  }
	
	  _createClass(Mesh, [{
	    key: 'calcCoords',
	    value: function calcCoords() {
	      var idx = 0;
	      for (var x = 0; x < 500; x++) {
	        for (var y = 100; y < 400; y++) {
	          if (!this.pointInPolygon(x, y, this.airfoilCoords)) {
	            this.coords.push([x, y, idx]);
	            this.rho.push(0);
	            idx += 1;
	          }
	        }
	      }
	    }
	  }, {
	    key: 'pointInPolygon',
	    value: function pointInPolygon(x, y, polygon) {
	      var inside = false;
	      for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
	        var xi = polygon[i][0],
	            yi = polygon[i][1];
	        var xj = polygon[j][0],
	            yj = polygon[j][1];
	
	        var intersect = yi > y != yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
	        if (intersect) inside = !inside;
	      }
	
	      return inside;
	    }
	  }, {
	    key: 'draw',
	    value: function draw() {
	      for (var i = 0; i < this.coords.length; i++) {
	        this.ctx.beginPath();
	        this.ctx.fillStyle = 'red';
	        this.ctx.arc(this.coords[i][0], this.coords[i][1], 1, 0, 2 * Math.PI, true);
	        this.ctx.fill();
	        this.ctx.closePath();
	      }
	    }
	  }, {
	    key: 'addSources',
	    value: function addSources(sources, dt) {
	      var _this = this;
	
	      var _loop = function _loop(i) {
	        var source = sources[i];
	        var coord = _this.coords.find(function (coord) {
	          return source[0] === coord[0] && source[1] === coord[1];
	        });
	        _this.rho[coord[2]] += dt * source[2];
	      };
	
	      for (var i = 0; i < sources.length; i++) {
	        _loop(i);
	      }
	    }
	  }, {
	    key: 'diffuse',
	    value: function diffuse() {}
	  }, {
	    key: 'setBounds',
	    value: function setBounds(b) {
	      for (var i = 1; i < this.lx - 2; i++) {
	        this.rho[i] = b === 1 ? -this.rho[i + this.lx] : this.rho[i + this.lx];
	        this.rho[this.rho.length - i - 1] = b === 1 ? -this.rho[this.rho.length - i - 1 - this.lx] : this.rho[this.rho.length - i - 1 - this.lx];
	        this.rho[i * this.lx + i];
	      }
	
	      this.rho[0] = 0.5 * (this.rho[1] + this.rho[this.lx + 1]);
	      this.rho[this.lx] = 0.5 * (this.rho[this.lx - 1] + this.rho[2 * this.lx]);
	      this.rho[this.rho.length - 1] = 0.5 * (this.rho[this.rho.length - 2] + this.rho[this.rho.length - this.lx - 2]);
	      this.rho[this.rho.length - this.lx - 1] = 0.5 * (this.rho[this.rho.length - this.lx] + this.rho[this.rho.length - 2 * this.lx - 1]);
	    }
	  }]);
	
	  return Mesh;
	}();
	
	// bounds: [0, 200], [0,400]
	// [500, 200], [500, 400]
	
	
	exports.default = Mesh;

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var View = function () {
	  function View(grid, ctx) {
	    _classCallCheck(this, View);
	
	    this.ctx = ctx;
	    this.grid = grid;
	  }
	
	  _createClass(View, [{
	    key: "start",
	    value: function start() {
	      this.lastTime = 0;
	      requestAnimationFrame(this.animate.bind(this));
	    }
	  }, {
	    key: "animate",
	    value: function animate(t) {
	      var dt = t - this.lastTime;
	
	      this.grid.step(dt);
	      this.grid.addParticles();
	      this.ctx.clearRect(0, 0, 500, 500);
	      this.grid.draw(this.ctx);
	      this.lastTime = t;
	
	      requestAnimationFrame(this.animate.bind(this));
	    }
	  }]);
	
	  return View;
	}();
	
	exports.default = View;

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map