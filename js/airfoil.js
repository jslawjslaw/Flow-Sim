import NACA2412 from './airfoils/NACA2412';
import NACA6409 from './airfoils/NACA6409';
import { rotation, multiply, subtract, add, degToRads } from './math';

export default class Airfoil {
  constructor(ctx, aAttack = 0) {
    this.ctx = ctx;
    this.aAttack = degToRads(aAttack);
  }

  calcCoords() {
    let x_sum = 0;
    let y_sum = 0;
    this.coords = NACA2412.map( (point) => {
      let p = multiply(rotation(Math.PI), point);
      const x_coor = 300*(p[0])+400;
      const y_coor = 300*(p[1])+250;
      x_sum += x_coor;
      y_sum += y_coor;

      return [ x_coor, y_coor ];
    });

    this.centroid = [ x_sum/(this.coords.length), y_sum/(this.coords.length) ];

    this.coords = subtract(this.coords, this.centroid);
    this.coords = this.coords.map( (point) => {
      return multiply(rotation(this.aAttack), point);
    });

    this.coords = add(this.coords, this.centroid);
  }

  draw() {
    this.calcCoords();
    this.ctx.beginPath();
    this.ctx.fillStyle = 'black';
    this.ctx.moveTo(this.coords[0][0], this.coords[0][1]);
    for(let i = 1; i < this.coords.length; i++) {
      this.ctx.lineTo(this.coords[i][0], this.coords[i][1]);
    }
    this.ctx.fill();
    this.ctx.closePath();
  }

  updateAngle(aAttack) {
    this.ctx.clearRect(0, 0, 500, 500);
    this.aAttack = degToRads(aAttack);
    this.draw();
  }
}
