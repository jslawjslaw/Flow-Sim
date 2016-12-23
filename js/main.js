import Grid from './grid';
import View from './view';

$( () => {
  const canvasEl = $("#canvas")[0];
  const angle = $("#range")[0];
  canvasEl.width = 500;
  canvasEl.height = 500;

  const ctx = canvasEl.getContext("2d");

  const grid = new Grid(ctx, angle);
  debugger
  grid.draw();

  $("#animate").click(() => animate(grid, ctx));
  $("#input-range").click((e) => updateAngle(e, grid));
});

function animate(grid, ctx) {
  new View(grid, ctx).start();
}

function updateAngle(e, grid) {
  $("#range-value").html(e.currentTarget.value);
  grid.airfoil.updateAngle(parseInt(e.currentTarget.value));
}
