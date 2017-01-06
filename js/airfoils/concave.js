import convex from './convex';
import { multiply, rotation, degToRads } from '../math';

const concave = convex.map( (point) => {
  return multiply(rotation(degToRads(180)), point);
});

module.exports = concave;
