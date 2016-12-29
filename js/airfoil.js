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
      const x_coor = 150*(point[0]+1)-70;
      const y_coor = 150*(point[1]+1);
      x_sum += x_coor;
      y_sum += y_coor;

      return [x_coor, y_coor];
    });

    this.centroid = [ x_sum/(this.coords.length), y_sum/(this.coords.length) ];
    this.coords = subtract(this.coords, this.centroid);
    this.coords = this.coords.map( (point) => {
      return multiply(rotation(this.aAttack), point);
    });

    this.coords = add(this.coords, this.centroid);
  }

  updateAngle(aAttack) {
    this.aAttack = degToRads(aAttack);
  }
}
