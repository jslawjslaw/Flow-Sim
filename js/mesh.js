import Airfoil from './airfoil';
import { pointInPolygon } from './selectors';

export default class Mesh {
  constructor(ctx, xdim, ydim, image) {
    this.ctx = ctx;
    this.image = image;
    this.xdim = xdim;
    this.ydim = ydim;

    // Create the arrays of fluid particle densities, etc. (using 1D arrays for speed):
    // To index into these arrays, use x + y*xdim, traversing rows first and then columns.
    this.n0 = new Array(xdim*ydim);			// microscopic densities along each lattice direction
    this.nN = new Array(xdim*ydim);
    this.nS = new Array(xdim*ydim);
    this.nE = new Array(xdim*ydim);
    this.nW = new Array(xdim*ydim);
    this.nNE = new Array(xdim*ydim);
    this.nSE = new Array(xdim*ydim);
    this.nNW = new Array(xdim*ydim);
    this.nSW = new Array(xdim*ydim);
    this.rho = new Array(xdim*ydim);			// macroscopic density
    this.ux = new Array(xdim*ydim);			// macroscopic velocity
    this.uy = new Array(xdim*ydim);
    this.curl = new Array(xdim*ydim);
    this.barrier = new Array(xdim*ydim);		// boolean array of barrier locations

    // Initialize airfoil and generate barrier points:
    this.airfoil = new Airfoil(ctx, 0)
    this.airfoil.calcCoords();
    for (let y = 0; y < ydim; y++) {
      for (let x = 0; x < xdim; x++) {
        if(pointInPolygon(x, y, this.airfoil.coords)) {
          this.barrier[x+y*xdim] = true;
        } else {
          this.barrier[x+y*xdim] = false;
        }
      }
    }

    // Initialize array of partially transparant blacks, for drawing flow lines:
    const transBlackArraySize = 50;
    this.transBlackArray = new Array(transBlackArraySize);
    for (let i = 0; i < transBlackArraySize; i++) {
      this.transBlackArray[i] = "rgba(0,0,0," + Number(i/transBlackArraySize).toFixed(2) + ")";
    }

    // Initialize tracers (but don't place them yet):
    this.nTracers = 144;
    this.tracerX = new Array(this.nTracers);
    this.tracerY = new Array(this.nTracers);
    for (let t = 0; t < this.nTracers; t++) {
      this.tracerX[t] = 0.0; this.tracerY[t] = 0.0;
    }

    this.setColors();
    this.initFluid();
  }

  updateSize(xdim, ydim) {
    this.xdim = xdim;
    this.ydim = ydim;
  }

  colorSquare(x, y, r, g, b) {
    let fy = this.ydim - y - 1;
    let index;
    for (let py = fy * window.pxPerSquare; py < (fy + 1) * window.pxPerSquare; py++) {
      for (let px = x * window.pxPerSquare; px < (x + 1) * window.pxPerSquare; px++) {
        index = (px + py*this.image.width) * 4;
        this.image.data[index+0] = r;
        this.image.data[index+1] = g;
        this.image.data[index+2] = b;
      }
    }
  }

  updateBarrier() {
    this.airfoil.calcCoords();
    for (let y = 0; y < this.ydim; y++) {
      for (let x = 0; x < this.xdim; x++) {
        if(pointInPolygon(x, y, this.airfoil.coords)) {
          this.barrier[x+y*this.xdim] = true;
        } else {
          this.barrier[x+y*this.xdim] = false;
        }
      }
    }
  }

  setColors() {
    // Set up the array of colors for plotting (mimicks matplotlib "jet" colormap):
    // (Kludge: Index nColors+1 labels the color used for drawing barriers.)
    var nColors = 400;							// there are actually nColors+2 colors
    this.redList = new Array(nColors+2);
    this.greenList = new Array(nColors+2);
    this.blueList = new Array(nColors+2);
    for (var c=0; c<=nColors; c++) {
      var r, g, b;
      if (c < nColors/8) {
        r = 0; g = 0; b = Math.round(255 * (c + nColors/8) / (nColors/4));
      } else if (c < 3*nColors/8) {
        r = 0; g = Math.round(255 * (c - nColors/8) / (nColors/4)); b = 255;
      } else if (c < 5*nColors/8) {
        r = Math.round(255 * (c - 3*nColors/8) / (nColors/4)); g = 255; b = 255 - r;
      } else if (c < 7*nColors/8) {
        r = 255; g = Math.round(255 * (7*nColors/8 - c) / (nColors/4)); b = 0;
      } else {
        r = Math.round(255 * (9*nColors/8 - c) / (nColors/4)); g = 0; b = 0;
      }
      this.redList[c] = r; this.greenList[c] = g; this.blueList[c] = b;
    }
    this.redList[nColors+1] = 0; this.greenList[nColors+1] = 0; this.blueList[nColors+1] = 0;	// barriers are black
  }

  initFluid() {
    const u0 = Number(window.speed);
    for (let y = 0; y < this.ydim; y++) {
      for (let x = 0; x < this.xdim; x++) {
        this.setEquil(x, y, u0, 0, 1);
        this.curl[x+y*this.xdim] = 0.0;
      }
    }
    this.paintCanvas();
  }

  paintCanvas() {
		let cIndex = 0;
		const contrast = Math.pow(1.2, Number(window.contrast));
    const nColors = 400;

		this.computeCurl();
		for (let y = 0; y < this.ydim; y++) {
			for (let x = 0; x < this.xdim; x++) {
				if (this.barrier[x+y*this.xdim]) {
					cIndex = nColors + 1;	// kludge for barrier color which isn't really part of color map
				} else {
					cIndex = Math.round(nColors * (this.curl[x+y*this.xdim]*5*contrast + 0.5));
					if (cIndex < 0) cIndex = 0;
					if (cIndex > nColors) cIndex = nColors;
				}
				this.colorSquare(x, y, this.redList[cIndex], this.greenList[cIndex], this.blueList[cIndex]);
			}
		}

    this.ctx.putImageData(this.image, 0, 0);		// blast image to the screen
		// Draw tracers if appropriate:
		if ($("#tracerCheck")[0].checked) this.drawTracers();
  }

  // Compute the curl (actually times 2) of the macroscopic velocity field, for plotting:
  computeCurl() {
    for (let y = 1; y < this.ydim - 1; y++) {			// interior sites only; leave edges set to zero
      for (let x = 1; x < this.xdim - 1; x++) {
        this.curl[x+y*this.xdim] = this.uy[x+1+y*this.xdim] - this.uy[x-1+y*this.xdim] - this.ux[x+(y+1)*this.xdim] + this.ux[x+(y-1)*this.xdim];
      }
    }
  }

  setEquil(x, y, newux, newuy, newrho) {
		const i = x + y*this.xdim;
		if (typeof newrho == 'undefined') {
			newrho = rho[i];
		}
		const ux3 = 3 * newux;
		const uy3 = 3 * newuy;
		const ux2 = newux * newux;
		const uy2 = newuy * newuy;
		const uxuy2 = 2 * newux * newuy;
		const u2 = ux2 + uy2;
		const u215 = 1.5 * u2;
		this.n0[i]  = (4.0 / 9.0) * newrho *  (1                              - u215);
		this.nE[i]  = (1.0 / 9.0) * newrho *  (1 + ux3       + 4.5*ux2        - u215);
		this.nW[i]  = (1.0 / 9.0) * newrho *  (1 - ux3       + 4.5*ux2        - u215);
		this.nN[i]  = (1.0 / 9.0) * newrho *  (1 + uy3       + 4.5*uy2        - u215);
		this.nS[i]  = (1.0 / 9.0) * newrho *  (1 - uy3       + 4.5*uy2        - u215);
		this.nNE[i] = (1.0 / 36.0) * newrho * (1 + ux3 + uy3 + 4.5*(u2+uxuy2) - u215);
		this.nSE[i] = (1.0 / 36.0) * newrho * (1 + ux3 - uy3 + 4.5*(u2-uxuy2) - u215);
		this.nNW[i] = (1.0 / 36.0) * newrho * (1 - ux3 + uy3 + 4.5*(u2-uxuy2) - u215);
		this.nSW[i] = (1.0 / 36.0) * newrho * (1 - ux3 - uy3 + 4.5*(u2+uxuy2) - u215);
		this.rho[i] = newrho;
		this.ux[i] = newux;
		this.uy[i] = newuy;
	}

  setBoundaries() {
    const u0 = Number(window.speed);

    for (let x = 0; x < this.xdim; x++) {
      this.setEquil(x, 0, u0, 0, 1);
      this.setEquil(x, this.ydim-1, u0, 0, 1);
    }

    for (let y = 1; y < this.ydim - 1; y++) {
      this.setEquil(0, y, u0, 0, 1);
      this.setEquil(this.xdim-1, y, u0, 0, 1);
    }
  }

  collide() {
		const viscosity = window.viscosity;	// kinematic viscosity coefficient in natural units
		const omega = 1 / (3*viscosity + 0.5);		// reciprocal of relaxation time

    let i, thisrho, thisux, thisuy;

		for (let y = 1; y < this.ydim - 1; y++) {
			for (let x = 1; x < this.xdim - 1; x++) {
				i = x + y * this.xdim;		// array index for this lattice site

				thisrho = this.n0[i] + this.nN[i] + this.nS[i] + this.nE[i] + this.nW[i] + this.nNW[i] + this.nNE[i] + this.nSW[i] + this.nSE[i];
        thisux = (this.nE[i] + this.nNE[i] + this.nSE[i] - this.nW[i] - this.nNW[i] - this.nSW[i]) / thisrho;
        thisuy = (this.nN[i] + this.nNE[i] + this.nNW[i] - this.nS[i] - this.nSE[i] - this.nSW[i]) / thisrho;

				this.rho[i] = thisrho;
				this.ux[i] = thisux;
				this.uy[i] = thisuy;

				var one9thrho = (1.0 / 9.0) * thisrho;		// pre-compute a bunch of stuff for optimization
				var one36thrho = (1.0 / 36.0) * thisrho;
				var ux3 = 3 * thisux;
				var uy3 = 3 * thisuy;
				var ux2 = thisux * thisux;
				var uy2 = thisuy * thisuy;
				var uxuy2 = 2 * thisux * thisuy;
				var u2 = ux2 + uy2;
				var u215 = 1.5 * u2;

				this.n0[i]  += omega * ((4.0 / 9.0)*thisrho * (1                       - u215) - this.n0[i]);
				this.nE[i]  += omega * (   one9thrho * (1 + ux3       + 4.5*ux2        - u215) - this.nE[i]);
				this.nW[i]  += omega * (   one9thrho * (1 - ux3       + 4.5*ux2        - u215) - this.nW[i]);
				this.nN[i]  += omega * (   one9thrho * (1 + uy3       + 4.5*uy2        - u215) - this.nN[i]);
				this.nS[i]  += omega * (   one9thrho * (1 - uy3       + 4.5*uy2        - u215) - this.nS[i]);
				this.nNE[i] += omega * (  one36thrho * (1 + ux3 + uy3 + 4.5*(u2+uxuy2) - u215) - this.nNE[i]);
				this.nSE[i] += omega * (  one36thrho * (1 + ux3 - uy3 + 4.5*(u2-uxuy2) - u215) - this.nSE[i]);
				this.nNW[i] += omega * (  one36thrho * (1 - ux3 + uy3 + 4.5*(u2-uxuy2) - u215) - this.nNW[i]);
				this.nSW[i] += omega * (  one36thrho * (1 - ux3 - uy3 + 4.5*(u2+uxuy2) - u215) - this.nSW[i]);
			}
		}

		for (let y = 1; y < this.ydim - 2; y++) {
			this.nW[this.xdim-1+y*this.xdim] = this.nW[this.xdim-2+y*this.xdim];		// at right end, copy left-flowing densities from next row to the left
			this.nNW[this.xdim-1+y*this.xdim] = this.nNW[this.xdim-2+y*this.xdim];
			this.nSW[this.xdim-1+y*this.xdim] = this.nSW[this.xdim-2+y*this.xdim];
		}
	}

  // Move particles along their directions of motion:
	stream() {
		for (let y = this.ydim - 2; y > 0; y--) {			// first start in NW corner...
			for (let x = 1; x < this.xdim - 1; x++) {
				this.nN[x+y*this.xdim] = this.nN[x+(y-1)*this.xdim];			// move the north-moving particles
				this.nNW[x+y*this.xdim] = this.nNW[x+1+(y-1)*this.xdim];		// and the northwest-moving particles
			}
		}
		for (let y = this.ydim - 2; y > 0; y--) {			// now start in NE corner...
			for (let x = this.xdim - 2; x > 0; x--) {
				this.nE[x+y*this.xdim] = this.nE[x-1+y*this.xdim];			// move the east-moving particles
				this.nNE[x+y*this.xdim] = this.nNE[x-1+(y-1)*this.xdim];		// and the northeast-moving particles
			}
		}
		for (let y = 1; y < this.ydim - 1; y++) {			// now start in SE corner...
			for (let x = this.xdim - 2; x > 0; x--) {
				this.nS[x+y*this.xdim] = this.nS[x+(y+1)*this.xdim];			// move the south-moving particles
				this.nSE[x+y*this.xdim] = this.nSE[x-1+(y+1)*this.xdim];		// and the southeast-moving particles
			}
		}
		for (let y = 1; y < this.ydim - 1; y++) {				// now start in the SW corner...
			for (let x = 1; x < this.xdim - 1; x++) {
				this.nW[x+y*this.xdim] = this.nW[x+1+y*this.xdim];			// move the west-moving particles
				this.nSW[x+y*this.xdim] = this.nSW[x+1+(y+1)*this.xdim];		// and the southwest-moving particles
			}
		}
    let index;
		for (let y = 1; y < this.ydim - 1; y++) {				// Now handle bounce-back from barriers
			for (let x = 1; x < this.xdim - 1; x++) {
				if (this.barrier[x+y*this.xdim]) {
					index = x + y*this.xdim;
					this.nE[x+1+y*this.xdim] = this.nW[index];
					this.nW[x-1+y*this.xdim] = this.nE[index];
					this.nN[x+(y+1)*this.xdim] = this.nS[index];
					this.nS[x+(y-1)*this.xdim] = this.nN[index];
					this.nNE[x+1+(y+1)*this.xdim] = this.nSW[index];
					this.nNW[x-1+(y+1)*this.xdim] = this.nSE[index];
					this.nSE[x+1+(y-1)*this.xdim] = this.nNW[index];
					this.nSW[x-1+(y-1)*this.xdim] = this.nNE[index];
        }
			}
		}
	}

  moveTracers() {
    let roundedX, roundedY, index;
    for (let t = 0; t < this.nTracers; t++) {
      roundedX = Math.round(this.tracerX[t]);
      roundedY = Math.round(this.tracerY[t]);
      index = roundedX + roundedY*this.xdim;
      this.tracerX[t] += this.ux[index];
      this.tracerY[t] += this.uy[index];
      if (this.tracerX[t] > this.xdim-1) {
        this.tracerX[t] = 0;
        this.tracerY[t] = Math.random() * this.ydim;
      }
    }
  }

  // Draw the tracer particles:
  drawTracers() {
    this.ctx.fillStyle = "rgb(150,150,150)";
    for (let t = 0; t < this.nTracers; t++) {
      var canvasX = (this.tracerX[t]+0.5) * window.pxPerSquare;
      var canvasY = $("#canvas")[0].height - (this.tracerY[t]+0.5) * window.pxPerSquare;
      this.ctx.fillRect(canvasX-1, canvasY-1, 2, 2);
    }
  }
}
