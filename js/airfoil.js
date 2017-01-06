import NACA0008 from './airfoils/NACA0008';
import NACA2412 from './airfoils/NACA2412';
import NACA6409 from './airfoils/NACA6409';
import plate from './airfoils/vertical_plate';
import concave from './airfoils/concave';
import convex from './airfoils/convex';
import { rotation, multiply, subtract, add, degToRads } from './math';

export default class Airfoil {
  constructor(ctx, aAttack = 0) {
    this.ctx = ctx;
    this.aAttack = degToRads(aAttack);
    this.changeShape();
  }

  calcCoords() {
    let x_sum = 0;
    let y_sum = 0;
    this.coords = this.shape.map( (point) => {
      let x_coor;
      if (this.shape === convex) {
        x_coor = Math.round((150*(point[0]+1)-50)/window.pxPerSquare);
      } else {
        x_coor = Math.round((150*(point[0]+1)-70)/window.pxPerSquare);
      }
      const y_coor = Math.round((150*(point[1]+1)-50)/window.pxPerSquare);
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

  changeShape() {
    switch (window.shape) {
      case 1:
        this.shape = plate;
        break;
      case 2:
        this.shape = NACA0008;
        break;
      case 3:
        this.shape = NACA2412;
        break;
      case 4:
        this.shape = NACA6409;
        break;
      case 5:
        this.shape = concave;
        break;
      case 6:
        this.shape = convex;
        break;
      default:
        this.shape = plate;
        break;
    }
  }
}
