export default class View {
  constructor(grid, ctx) {
    this.ctx = ctx;
    this.grid = grid;
  }

  start() {
    this.lastTime = 0;
    requestAnimationFrame(this.animate.bind(this));
  }

  animate(t) {
    const dt = t - this.lastTime;

    this.grid.step(dt);
    this.grid.addParticles();
    this.ctx.clearRect(0,0,500,500);
    this.grid.draw(this.ctx);
    this.lastTime = t;

    requestAnimationFrame(this.animate.bind(this));
  }
}
