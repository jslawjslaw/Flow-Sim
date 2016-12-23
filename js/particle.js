export default class Particle {
  constructor(options) {
    this.x = options.x,
    this.y = options.y,
    this.vx = -5,
    this.vy = 0,
    this.radius = 2,
    this.color = 'blue',
    this.grid = options.grid,
    this.rho = Math.rand()
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(
      this.x, this.y, this.radius, 0, 2 * Math.PI, true
    );
    ctx.fill();
  }

  move(dt, idx) {
    const velScale = dt * 60 / 1000;
    const dx = this.vx * velScale;
    const dy = this.vy * velScale;

    this.x = this.x + dx;
    this.y = this.y + dy;

    if (this.grid.outOfBounds(this.x, this.y)) {
      this.grid.addToRemoveQueue(idx);
    }
  }
}
