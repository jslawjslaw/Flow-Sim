export default class Mesh {
  constructor(airfoilCoords, ctx) {
    this.coords = [];
    this.airfoilCoords = airfoilCoords;
    this.ctx = ctx;
    this.rho = [];
    this.calcCoords();

    this.lx = 500;
    this.ly = 300;
  }

  calcCoords() {
    let idx = 0;
    for(let x = 0; x < 500; x++) {
      for(let y = 100; y < 400; y++) {
        if (!this.pointInPolygon(x, y, this.airfoilCoords)) {
          this.coords.push([x, y, idx]);
          this.rho.push(0);
          idx += 1;
        }
      }
    }
  }

  pointInPolygon(x, y, polygon) {
    var inside = false;
    for(var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      var xi = polygon[i][0], yi = polygon[i][1];
      var xj = polygon[j][0], yj = polygon[j][1];

      var intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }

  draw() {
    for (let i = 0; i < this.coords.length; i++) {
      this.ctx.beginPath();
      this.ctx.fillStyle = 'red';
      this.ctx.arc(
        this.coords[i][0], this.coords[i][1], 1, 0, 2 * Math.PI, true
      );
      this.ctx.fill();
      this.ctx.closePath();
    }
  }

  addSources(sources, dt) {
    for(let i = 0; i < sources.length; i++) {
      let source = sources[i];
      let coord = this.coords.find((coord) => (source[0] === coord[0] && source[1] === coord[1]));
      this.rho[coord[2]] += dt*source[2];
    }
  }

  diffuse() {

  }

  setBounds(b) {
    for(let i = 1; i < this.lx - 2; i++) {
      this.rho[i] = b === 1 ? -this.rho[i + this.lx] : this.rho[i + this.lx];
      this.rho[this.rho.length - i - 1] = b === 1 ? -this.rho[this.rho.length - i - 1 - this.lx] : this.rho[this.rho.length - i - 1 - this.lx] ;
      this.rho[i*(this.lx) + i]
    }

    this.rho[0] = 0.5*(this.rho[1] + this.rho[this.lx + 1]);
    this.rho[this.lx] = 0.5*(this.rho[this.lx - 1] + this.rho[2*this.lx]);
    this.rho[this.rho.length - 1] = 0.5*(this.rho[this.rho.length - 2] + this.rho[this.rho.length - this.lx - 2]);
    this.rho[this.rho.length - this.lx - 1] = 0.5*(this.rho[this.rho.length - this.lx] + this.rho[this.rho.length - 2*this.lx - 1]);
  }
}

// bounds: [0, 200], [0,400]
// [500, 200], [500, 400]
