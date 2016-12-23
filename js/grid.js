import Airfoil from './airfoil';
import Particle from './particle';
import Mesh from './mesh';

export default class Grid {
  constructor(ctx, angle) {
    this.particles = [];
    this.ctx = ctx;
    this.airfoil = new Airfoil(ctx, angle);
    this.removeQueue = [];
  }

  addParticles() {
    for(let i = 0; i < 100; i++) {
      this.particles.push(
        new Particle({ grid: this, x: 500, y: 250*Math.random() + 100 })
      );
    }
  }

  outOfBounds(x, y) {
    return (
      (x < 0) || (x > 500) || (y < 0) || (y > 500)
    );
  }

  draw(ctx) {
    this.airfoil.draw();
    this.mesh = new Mesh(this.airfoil.coords, this.ctx);
    this.mesh.draw();
    this.particles.forEach( (particle) => {
      particle.draw(this.ctx);
    });
  }

  step(dt) {
    this.moveParticles(dt);
  }

  moveParticles(dt) {
    this.particles.forEach( (particle, idx) => {
      particle.move(dt, idx);
    });

    this.clearRemoveQueue();
  }

  addToRemoveQueue(idx) {
    this.removeQueue.push(idx);
  }

  clearRemoveQueue(idx) {
    for(let i = this.removeQueue.length - 1; i >= 0; i--) {
      this.particles.splice(this.removeQueue[i], 1);
    }

    this.removeQueue = [];
  }
}
