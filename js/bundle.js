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

	"use strict";
	
	var _mesh = __webpack_require__(1);
	
	var _mesh2 = _interopRequireDefault(_mesh);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	$(function () {
	  var canvas = $("#canvas")[0];
	  var angle = $("#range")[0];
	
	  canvas.width = 300;
	  canvas.height = 300;
	  window.stepCount = 0;
	  window.startTime = 0;
	  window.speed = Number($("#speedValue").text());
	  window.steps = 20;
	  window.viscosity = 0.02;
	  window.contrast = 0;
	  window.time = 0;
	  window.running = false;
	  window.pxPerSquare = 1;
	
	  var ctx = canvas.getContext("2d");
	  var image = ctx.createImageData(canvas.width, canvas.height); // faster than clearRect
	  for (var i = 3; i < image.data.length; i += 4) {
	    image.data[i] = 255; // set all alpha values to opaque
	  }
	
	  var mesh = new _mesh2.default(ctx, Math.ceil(canvas.width / window.pxPerSquare), Math.ceil(canvas.height / window.pxPerSquare), image);
	
	  $("#animate").click(function () {
	    return animate(mesh);
	  });
	  $("#angleSlider").change(function (e) {
	    return updateAngle(e, mesh);
	  });
	  $("#stepSlider").change(function (e) {
	    return resetTimer(e);
	  });
	  $("#speedSlider").change(function (e) {
	    return adjustSpeed(e);
	  });
	  $("#viscSlider").change(function (e) {
	    return adjustViscosity(e);
	  });
	  $("#contrastSlider").change(function (e) {
	    return adjustContrast(e, mesh);
	  });
	  $("#tracerCheck").change(function (e) {
	    return initTracers(e, mesh);
	  });
	});
	
	function animate(mesh) {
	  window.running = !window.running;
	  if (window.running) {
	    $("#animate").html("Pause");
	    reset();
	    simulate(mesh);
	  } else {
	    $("#animate").html("Run");
	  }
	}
	
	function updateAngle(e, mesh) {
	  $("#angleValue").html(e.currentTarget.value);
	  mesh.airfoil.updateAngle(parseInt(e.currentTarget.value));
	  mesh.updateBarrier();
	  mesh.paintCanvas();
	}
	
	function adjustSpeed(e) {
	  $("#speedValue").html(e.currentTarget.value);
	  window.speed = e.currentTarget.value;
	}
	
	function adjustViscosity(e) {
	  $("#viscValue").html(e.currentTarget.value);
	  window.viscosity = Number(e.currentTarget.value);
	}
	
	function reset() {
	  window.stepCount = 0;
	  window.startTime = new Date().getTime();
	}
	
	function resetTimer(e) {
	  $("#stepValue").html(e.currentTarget.value);
	  window.steps = Number(e.currentTarget.value);
	  reset();
	}
	
	function adjustContrast(e, mesh) {
	  $("#contrastValue").html(e.currentTarget.value);
	  window.contrast = Number(e.currentTarget.value);
	  mesh.paintCanvas();
	}
	
	function initTracers(e, mesh) {
	  if (e.currentTarget.checked) {
	    var nRows = Math.ceil(Math.sqrt(mesh.nTracers));
	    var dx = mesh.xdim / nRows;
	    var dy = mesh.ydim / nRows;
	    var nextX = dx / 2;
	    var nextY = dy / 2;
	    for (var t = 0; t < mesh.nTracers; t++) {
	      mesh.tracerX[t] = nextX;
	      mesh.tracerY[t] = nextY;
	      nextX += dx;
	      if (nextX > mesh.xdim) {
	        nextX = dx / 2;
	        nextY += dy;
	      }
	    }
	  }
	  mesh.paintCanvas();
	}
	
	function simulate(mesh) {
	  var stepsPerFrame = Number(window.steps); // number of simulation steps per animation frame
	  mesh.setBoundaries();
	
	  // Execute a bunch of time steps:
	  for (var step = 0; step < stepsPerFrame; step++) {
	    mesh.collide();
	    mesh.stream();
	    if ($("#tracerCheck")[0].checked) mesh.moveTracers();
	    window.time++;
	  }
	
	  mesh.paintCanvas();
	
	  if (window.running) {
	    window.stepCount += stepsPerFrame;
	    window.setTimeout(function () {
	      return simulate(mesh);
	    }, 1);
	  }
	
	  var stable = true;
	  for (var x = 0; x < mesh.xdim; x++) {
	    var index = x + mesh.ydim / 2 * mesh.xdim; // look at middle row only
	    if (mesh.rho[index] <= 0) stable = false;
	  }
	
	  if (!stable) {
	    window.alert("The simulation has become unstable due to excessive fluid speeds.");
	    animate(mesh);
	    mesh.initFluid();
	  }
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _airfoil = __webpack_require__(2);
	
	var _airfoil2 = _interopRequireDefault(_airfoil);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Mesh = function () {
	  function Mesh(ctx, xdim, ydim, image) {
	    var _this = this;
	
	    _classCallCheck(this, Mesh);
	
	    this.ctx = ctx;
	    this.image = image;
	    this.xdim = xdim;
	    this.ydim = ydim;
	
	    // Create the arrays of fluid particle densities, etc. (using 1D arrays for speed):
	    // To index into these arrays, use x + y*xdim, traversing rows first and then columns.
	    this.n0 = new Array(xdim * ydim); // microscopic densities along each lattice direction
	    this.nN = new Array(xdim * ydim);
	    this.nS = new Array(xdim * ydim);
	    this.nE = new Array(xdim * ydim);
	    this.nW = new Array(xdim * ydim);
	    this.nNE = new Array(xdim * ydim);
	    this.nSE = new Array(xdim * ydim);
	    this.nNW = new Array(xdim * ydim);
	    this.nSW = new Array(xdim * ydim);
	    this.rho = new Array(xdim * ydim); // macroscopic density
	    this.ux = new Array(xdim * ydim); // macroscopic velocity
	    this.uy = new Array(xdim * ydim);
	    this.curl = new Array(xdim * ydim);
	    this.barrier = new Array(xdim * ydim); // boolean array of barrier locations
	
	    // Initialize to a steady rightward flow with no barriers:
	    for (var _y = 0; _y < ydim; _y++) {
	      for (var _x = 0; _x < xdim; _x++) {
	        this.barrier[_x + _y * xdim] = false;
	      }
	    }
	    // Initialize array of partially transparant blacks, for drawing flow lines:
	    var transBlackArraySize = 50;
	    this.transBlackArray = new Array(transBlackArraySize);
	    for (var _i = 0; _i < transBlackArraySize; _i++) {
	      this.transBlackArray[_i] = "rgba(0,0,0," + Number(_i / transBlackArraySize).toFixed(2) + ")";
	    }
	
	    // Initialize tracers (but don't place them yet):
	    this.nTracers = 144;
	    this.tracerX = new Array(this.nTracers);
	    this.tracerY = new Array(this.nTracers);
	    for (var t = 0; t < this.nTracers; t++) {
	      this.tracerX[t] = 0.0;this.tracerY[t] = 0.0;
	    }
	
	    // Initialize airfoil and generate barrier points:
	    this.airfoil = new _airfoil2.default(ctx, 0);
	    this.airfoil.calcCoords();
	    var x = void 0,
	        y = void 0,
	        i = void 0;
	    this.airfoil.coords.forEach(function (coord) {
	      x = Math.floor(coord[0]);
	      y = Math.floor(coord[1]);
	      i = x + y * xdim;
	      _this.barrier[i] = true;
	    });
	
	    this.barrier[Math.floor(this.airfoil.centroid[0]) + Math.floor(this.airfoil.centroid[1]) * xdim] = true;
	
	    this.setColors();
	    this.initFluid();
	  }
	
	  _createClass(Mesh, [{
	    key: "colorSquare",
	    value: function colorSquare(x, y, r, g, b) {
	      var fy = this.ydim - y - 1;
	      var index = void 0;
	      for (var py = fy * window.pxPerSquare; py < (fy + 1) * window.pxPerSquare; py++) {
	        for (var px = x * window.pxPerSquare; px < (x + 1) * window.pxPerSquare; px++) {
	          index = (px + py * this.image.width) * 4;
	          this.image.data[index + 0] = r;
	          this.image.data[index + 1] = g;
	          this.image.data[index + 2] = b;
	        }
	      }
	    }
	  }, {
	    key: "updateBarrier",
	    value: function updateBarrier() {
	      var _this2 = this;
	
	      for (var _y2 = 0; _y2 < this.ydim; _y2++) {
	        for (var _x2 = 0; _x2 < this.xdim; _x2++) {
	          this.barrier[_x2 + _y2 * this.xdim] = false;
	        }
	      }
	
	      this.airfoil.calcCoords();
	      var x = void 0,
	          y = void 0,
	          i = void 0;
	      this.airfoil.coords.forEach(function (coord) {
	        x = Math.floor(coord[0]);
	        y = Math.floor(coord[1]);
	        i = x + y * _this2.xdim;
	        _this2.barrier[i] = true;
	      });
	
	      this.barrier[Math.floor(this.airfoil.centroid[0]) + Math.floor(this.airfoil.centroid[1]) * this.xdim] = true;
	    }
	  }, {
	    key: "setColors",
	    value: function setColors() {
	      // Set up the array of colors for plotting (mimicks matplotlib "jet" colormap):
	      // (Kludge: Index nColors+1 labels the color used for drawing barriers.)
	      var nColors = 400; // there are actually nColors+2 colors
	      this.redList = new Array(nColors + 2);
	      this.greenList = new Array(nColors + 2);
	      this.blueList = new Array(nColors + 2);
	      for (var c = 0; c <= nColors; c++) {
	        var r, g, b;
	        if (c < nColors / 8) {
	          r = 0;g = 0;b = Math.round(255 * (c + nColors / 8) / (nColors / 4));
	        } else if (c < 3 * nColors / 8) {
	          r = 0;g = Math.round(255 * (c - nColors / 8) / (nColors / 4));b = 255;
	        } else if (c < 5 * nColors / 8) {
	          r = Math.round(255 * (c - 3 * nColors / 8) / (nColors / 4));g = 255;b = 255 - r;
	        } else if (c < 7 * nColors / 8) {
	          r = 255;g = Math.round(255 * (7 * nColors / 8 - c) / (nColors / 4));b = 0;
	        } else {
	          r = Math.round(255 * (9 * nColors / 8 - c) / (nColors / 4));g = 0;b = 0;
	        }
	        this.redList[c] = r;this.greenList[c] = g;this.blueList[c] = b;
	      }
	      this.redList[nColors + 1] = 0;this.greenList[nColors + 1] = 0;this.blueList[nColors + 1] = 0; // barriers are black
	    }
	  }, {
	    key: "initFluid",
	    value: function initFluid() {
	      var u0 = Number(window.speed);
	      for (var y = 0; y < this.ydim; y++) {
	        for (var x = 0; x < this.xdim; x++) {
	          this.setEquil(x, y, u0, 0, 1);
	          this.curl[x + y * this.xdim] = 0.0;
	        }
	      }
	      this.paintCanvas();
	    }
	  }, {
	    key: "paintCanvas",
	    value: function paintCanvas() {
	      var cIndex = 0;
	      var contrast = Math.pow(1.2, Number(window.contrast));
	      var nColors = 400;
	
	      this.computeCurl();
	      for (var y = 0; y < this.ydim; y++) {
	        for (var x = 0; x < this.xdim; x++) {
	          if (this.barrier[x + y * this.xdim]) {
	            cIndex = nColors + 1; // kludge for barrier color which isn't really part of color map
	          } else {
	            cIndex = Math.round(nColors * (this.curl[x + y * this.xdim] * 5 * contrast + 0.5));
	            if (cIndex < 0) cIndex = 0;
	            if (cIndex > nColors) cIndex = nColors;
	          }
	          this.colorSquare(x, y, this.redList[cIndex], this.greenList[cIndex], this.blueList[cIndex]);
	        }
	      }
	
	      this.ctx.putImageData(this.image, 0, 0); // blast image to the screen
	      // Draw tracers if appropriate:
	      if ($("#tracerCheck")[0].checked) this.drawTracers();
	    }
	
	    // Compute the curl (actually times 2) of the macroscopic velocity field, for plotting:
	
	  }, {
	    key: "computeCurl",
	    value: function computeCurl() {
	      for (var y = 1; y < this.ydim - 1; y++) {
	        // interior sites only; leave edges set to zero
	        for (var x = 1; x < this.xdim - 1; x++) {
	          this.curl[x + y * this.xdim] = this.uy[x + 1 + y * this.xdim] - this.uy[x - 1 + y * this.xdim] - this.ux[x + (y + 1) * this.xdim] + this.ux[x + (y - 1) * this.xdim];
	        }
	      }
	    }
	  }, {
	    key: "setEquil",
	    value: function setEquil(x, y, newux, newuy, newrho) {
	      var i = x + y * this.xdim;
	      if (typeof newrho == 'undefined') {
	        newrho = rho[i];
	      }
	      var ux3 = 3 * newux;
	      var uy3 = 3 * newuy;
	      var ux2 = newux * newux;
	      var uy2 = newuy * newuy;
	      var uxuy2 = 2 * newux * newuy;
	      var u2 = ux2 + uy2;
	      var u215 = 1.5 * u2;
	      this.n0[i] = 4.0 / 9.0 * newrho * (1 - u215);
	      this.nE[i] = 1.0 / 9.0 * newrho * (1 + ux3 + 4.5 * ux2 - u215);
	      this.nW[i] = 1.0 / 9.0 * newrho * (1 - ux3 + 4.5 * ux2 - u215);
	      this.nN[i] = 1.0 / 9.0 * newrho * (1 + uy3 + 4.5 * uy2 - u215);
	      this.nS[i] = 1.0 / 9.0 * newrho * (1 - uy3 + 4.5 * uy2 - u215);
	      this.nNE[i] = 1.0 / 36.0 * newrho * (1 + ux3 + uy3 + 4.5 * (u2 + uxuy2) - u215);
	      this.nSE[i] = 1.0 / 36.0 * newrho * (1 + ux3 - uy3 + 4.5 * (u2 - uxuy2) - u215);
	      this.nNW[i] = 1.0 / 36.0 * newrho * (1 - ux3 + uy3 + 4.5 * (u2 - uxuy2) - u215);
	      this.nSW[i] = 1.0 / 36.0 * newrho * (1 - ux3 - uy3 + 4.5 * (u2 + uxuy2) - u215);
	      this.rho[i] = newrho;
	      this.ux[i] = newux;
	      this.uy[i] = newuy;
	    }
	  }, {
	    key: "setBoundaries",
	    value: function setBoundaries() {
	      var u0 = Number(window.speed);
	
	      for (var x = 0; x < this.xdim; x++) {
	        this.setEquil(x, 0, u0, 0, 1);
	        this.setEquil(x, this.ydim - 1, u0, 0, 1);
	      }
	
	      for (var y = 1; y < this.ydim - 1; y++) {
	        this.setEquil(0, y, u0, 0, 1);
	        this.setEquil(this.xdim - 1, y, u0, 0, 1);
	      }
	    }
	  }, {
	    key: "collide",
	    value: function collide() {
	      var viscosity = window.viscosity; // kinematic viscosity coefficient in natural units
	      var omega = 1 / (3 * viscosity + 0.5); // reciprocal of relaxation time
	
	      var i = void 0,
	          thisrho = void 0,
	          thisux = void 0,
	          thisuy = void 0;
	
	      for (var y = 1; y < this.ydim - 1; y++) {
	        for (var x = 1; x < this.xdim - 1; x++) {
	          i = x + y * this.xdim; // array index for this lattice site
	
	          thisrho = this.n0[i] + this.nN[i] + this.nS[i] + this.nE[i] + this.nW[i] + this.nNW[i] + this.nNE[i] + this.nSW[i] + this.nSE[i];
	          thisux = (this.nE[i] + this.nNE[i] + this.nSE[i] - this.nW[i] - this.nNW[i] - this.nSW[i]) / thisrho;
	          thisuy = (this.nN[i] + this.nNE[i] + this.nNW[i] - this.nS[i] - this.nSE[i] - this.nSW[i]) / thisrho;
	
	          this.rho[i] = thisrho;
	          this.ux[i] = thisux;
	          this.uy[i] = thisuy;
	
	          var one9thrho = 1.0 / 9.0 * thisrho; // pre-compute a bunch of stuff for optimization
	          var one36thrho = 1.0 / 36.0 * thisrho;
	          var ux3 = 3 * thisux;
	          var uy3 = 3 * thisuy;
	          var ux2 = thisux * thisux;
	          var uy2 = thisuy * thisuy;
	          var uxuy2 = 2 * thisux * thisuy;
	          var u2 = ux2 + uy2;
	          var u215 = 1.5 * u2;
	
	          this.n0[i] += omega * (4.0 / 9.0 * thisrho * (1 - u215) - this.n0[i]);
	          this.nE[i] += omega * (one9thrho * (1 + ux3 + 4.5 * ux2 - u215) - this.nE[i]);
	          this.nW[i] += omega * (one9thrho * (1 - ux3 + 4.5 * ux2 - u215) - this.nW[i]);
	          this.nN[i] += omega * (one9thrho * (1 + uy3 + 4.5 * uy2 - u215) - this.nN[i]);
	          this.nS[i] += omega * (one9thrho * (1 - uy3 + 4.5 * uy2 - u215) - this.nS[i]);
	          this.nNE[i] += omega * (one36thrho * (1 + ux3 + uy3 + 4.5 * (u2 + uxuy2) - u215) - this.nNE[i]);
	          this.nSE[i] += omega * (one36thrho * (1 + ux3 - uy3 + 4.5 * (u2 - uxuy2) - u215) - this.nSE[i]);
	          this.nNW[i] += omega * (one36thrho * (1 - ux3 + uy3 + 4.5 * (u2 - uxuy2) - u215) - this.nNW[i]);
	          this.nSW[i] += omega * (one36thrho * (1 - ux3 - uy3 + 4.5 * (u2 + uxuy2) - u215) - this.nSW[i]);
	        }
	      }
	
	      for (var _y3 = 1; _y3 < this.ydim - 2; _y3++) {
	        this.nW[this.xdim - 1 + _y3 * this.xdim] = this.nW[this.xdim - 2 + _y3 * this.xdim]; // at right end, copy left-flowing densities from next row to the left
	        this.nNW[this.xdim - 1 + _y3 * this.xdim] = this.nNW[this.xdim - 2 + _y3 * this.xdim];
	        this.nSW[this.xdim - 1 + _y3 * this.xdim] = this.nSW[this.xdim - 2 + _y3 * this.xdim];
	      }
	    }
	
	    // Move particles along their directions of motion:
	
	  }, {
	    key: "stream",
	    value: function stream() {
	      for (var y = this.ydim - 2; y > 0; y--) {
	        // first start in NW corner...
	        for (var x = 1; x < this.xdim - 1; x++) {
	          this.nN[x + y * this.xdim] = this.nN[x + (y - 1) * this.xdim]; // move the north-moving particles
	          this.nNW[x + y * this.xdim] = this.nNW[x + 1 + (y - 1) * this.xdim]; // and the northwest-moving particles
	        }
	      }
	      for (var _y4 = this.ydim - 2; _y4 > 0; _y4--) {
	        // now start in NE corner...
	        for (var _x3 = this.xdim - 2; _x3 > 0; _x3--) {
	          this.nE[_x3 + _y4 * this.xdim] = this.nE[_x3 - 1 + _y4 * this.xdim]; // move the east-moving particles
	          this.nNE[_x3 + _y4 * this.xdim] = this.nNE[_x3 - 1 + (_y4 - 1) * this.xdim]; // and the northeast-moving particles
	        }
	      }
	      for (var _y5 = 1; _y5 < this.ydim - 1; _y5++) {
	        // now start in SE corner...
	        for (var _x4 = this.xdim - 2; _x4 > 0; _x4--) {
	          this.nS[_x4 + _y5 * this.xdim] = this.nS[_x4 + (_y5 + 1) * this.xdim]; // move the south-moving particles
	          this.nSE[_x4 + _y5 * this.xdim] = this.nSE[_x4 - 1 + (_y5 + 1) * this.xdim]; // and the southeast-moving particles
	        }
	      }
	      for (var _y6 = 1; _y6 < this.ydim - 1; _y6++) {
	        // now start in the SW corner...
	        for (var _x5 = 1; _x5 < this.xdim - 1; _x5++) {
	          this.nW[_x5 + _y6 * this.xdim] = this.nW[_x5 + 1 + _y6 * this.xdim]; // move the west-moving particles
	          this.nSW[_x5 + _y6 * this.xdim] = this.nSW[_x5 + 1 + (_y6 + 1) * this.xdim]; // and the southwest-moving particles
	        }
	      }
	      var index = void 0;
	      for (var _y7 = 1; _y7 < this.ydim - 1; _y7++) {
	        // Now handle bounce-back from barriers
	        for (var _x6 = 1; _x6 < this.xdim - 1; _x6++) {
	          if (this.barrier[_x6 + _y7 * this.xdim]) {
	            index = _x6 + _y7 * this.xdim;
	            this.nE[_x6 + 1 + _y7 * this.xdim] = this.nW[index];
	            this.nW[_x6 - 1 + _y7 * this.xdim] = this.nE[index];
	            this.nN[_x6 + (_y7 + 1) * this.xdim] = this.nS[index];
	            this.nS[_x6 + (_y7 - 1) * this.xdim] = this.nN[index];
	            this.nNE[_x6 + 1 + (_y7 + 1) * this.xdim] = this.nSW[index];
	            this.nNW[_x6 - 1 + (_y7 + 1) * this.xdim] = this.nSE[index];
	            this.nSE[_x6 + 1 + (_y7 - 1) * this.xdim] = this.nNW[index];
	            this.nSW[_x6 - 1 + (_y7 - 1) * this.xdim] = this.nNE[index];
	          }
	        }
	      }
	    }
	  }, {
	    key: "moveTracers",
	    value: function moveTracers() {
	      var roundedX = void 0,
	          roundedY = void 0,
	          index = void 0;
	      for (var t = 0; t < this.nTracers; t++) {
	        roundedX = Math.round(this.tracerX[t]);
	        roundedY = Math.round(this.tracerY[t]);
	        index = roundedX + roundedY * this.xdim;
	        this.tracerX[t] += this.ux[index];
	        this.tracerY[t] += this.uy[index];
	        if (this.tracerX[t] > this.xdim - 1) {
	          this.tracerX[t] = 0;
	          this.tracerY[t] = Math.random() * this.ydim;
	        }
	      }
	    }
	
	    // Draw the tracer particles:
	
	  }, {
	    key: "drawTracers",
	    value: function drawTracers() {
	      this.ctx.fillStyle = "rgb(150,150,150)";
	      for (var t = 0; t < this.nTracers; t++) {
	        var canvasX = (this.tracerX[t] + 0.5) * window.pxPerSquare;
	        var canvasY = $("#canvas")[0].height - (this.tracerY[t] + 0.5) * window.pxPerSquare;
	        this.ctx.fillRect(canvasX - 1, canvasY - 1, 2, 2);
	      }
	    }
	  }, {
	    key: "pointInPolygon",
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
	  }]);
	
	  return Mesh;
	}();
	
	// bounds: [0, 200], [0,400]
	// [500, 200], [500, 400]
	
	
	exports.default = Mesh;

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
	        var x_coor = 150 * (point[0] + 1) - 70;
	        var y_coor = 150 * (point[1] + 1);
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
	    key: 'updateAngle',
	    value: function updateAngle(aAttack) {
	      this.aAttack = (0, _math.degToRads)(aAttack);
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
	
	var NACA6409 = [[1.00000, 0.00000], [0.99732, 0.00084], [0.98930, 0.00333], [0.97603, 0.00737], [0.95760, 0.01284], [0.93423, 0.01954], [0.90615, 0.02724], [0.87357, 0.03571], [0.83690, 0.04464], [0.79647, 0.05378], [0.75272, 0.06283], [0.70608, 0.07153], [0.65710, 0.07961], [0.60627, 0.08684], [0.55413, 0.09302], [0.50132, 0.09796], [0.44840, 0.10152], [0.39590, 0.10360], [0.34367, 0.10352], [0.29315, 0.10086], [0.24502, 0.09584], [0.19988, 0.08874], [0.15830, 0.07992], [0.12080, 0.06982], [0.08780, 0.05889], [0.05968, 0.04762], [0.03677, 0.03646], [0.01920, 0.02581], [0.00720, 0.01603], [0.00080, 0.00737], [0.00000, 0.00000], [0.00467, -0.00573], [0.01467, -0.00956], [0.02973, -0.01157], [0.04970, -0.01192], [0.07428, -0.01080], [0.10317, -0.00844], [0.13607, -0.00513], [0.17257, -0.00119], [0.21235, 0.00307], [0.25498, 0.00729], [0.30012, 0.01112], [0.34730, 0.01425], [0.39618, 0.01639], [0.44707, 0.01772], [0.49868, 0.01871], [0.55040, 0.01925], [0.60167, 0.01929], [0.65193, 0.01880], [0.70065, 0.01780], [0.74728, 0.01634], [0.79130, 0.01451], [0.83223, 0.01241], [0.86957, 0.01017], [0.90288, 0.00791], [0.93180, 0.00576], [0.95593, 0.00383], [0.97503, 0.00221], [0.98883, 0.00101], [0.99722, 0.00025], [1.00000, 0.00000]];
	
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

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map