import Mesh from './mesh';

$( () => {
  const canvas = $("#canvas")[0];
  const angle = $("#range")[0];
  canvas.width = 500;
  canvas.height = 200;
  window.stepCount = 0;
  window.startTime = 0;
  window.speed = Number($("#speedValue").val());
  window.steps = 20;
  window.viscosity = 0.02;
  window.contrast = 0;
  window.time = 0;
  window.running = false;
  window.pxPerSquare = 2;
  window.shape = 1;

  const ctx = canvas.getContext("2d");
  let image = ctx.createImageData(canvas.width, canvas.height);
  for (let i = 3; i < image.data.length; i += 4) {
    image.data[i] = 255;			// set all alpha values to opaque
  }

  window.mesh = new Mesh(ctx, canvas.width/window.pxPerSquare, canvas.height/window.pxPerSquare, image);

  $("#animate").click(animate);
  $("#angleSlider").change((e) => updateAngle(e));
  $("#stepSlider").change((e) => resetTimer(e));
  $("#speedSlider").change((e) => adjustSpeed(e));
  $("#viscSlider").change((e) => adjustViscosity(e));
  $("#contrastSlider").change((e) => adjustContrast(e));
  $("#tracerCheck").change((e) => initTracers(e));
  $(".shape").click((e) => selectShape(e));
  $("#resolution").change((e) => adjustResolution(e, image, ctx));
  $("#reset").click((e) => resetCanvas(ctx, image));
});

function animate() {
  window.running = !window.running;
  if (window.running) {
    if ($("#error").attr("class") === "error-show") {
      $("#error").removeClass("error-show").addClass("error");
    }
    $("#animate").html("Pause");
    reset();
    simulate();
  } else {
    $("#animate").html("Run Simulation");
  }
}

function updateAngle(e) {
  $("#angleValue").val(e.currentTarget.value);
  window.mesh.airfoil.updateAngle(parseInt(e.currentTarget.value));
  window.mesh.updateBarrier();
  window.mesh.paintCanvas();
}

function selectShape(e) {
  $(`#${window.shape}`).removeClass("selectedShape")
  window.shape = Number(e.currentTarget.id);
  $(`#${e.currentTarget.id}`).addClass("selectedShape"); // change css here
  window.mesh.airfoil.changeShape();
  window.mesh.updateBarrier();
  window.mesh.paintCanvas();
}

function adjustSpeed(e) {
  $("#speedValue").val(e.currentTarget.value);
  window.speed = e.currentTarget.value;
}

function adjustViscosity(e) {
  $("#viscValue").val(e.currentTarget.value);
  window.viscosity = Number(e.currentTarget.value);
}

function reset() {
  window.stepCount = 0;
  window.startTime = (new Date()).getTime();
}

function resetTimer(e) {
  $("#stepValue").val(e.currentTarget.value);
  window.steps = Number(e.currentTarget.value);
  reset();
}

function adjustContrast(e) {
  $("#contrastValue").val(e.currentTarget.value);
  window.contrast = Number(e.currentTarget.value);
  window.mesh.paintCanvas();
}

function adjustResolution(e, image, ctx) {
  if (window.running) {
    window.running = !window.running;
    $("#animate").html("Run Simulation");
  }

  if (e.currentTarget.checked) {
    window.pxPerSquare = 1;
  } else {
    window.pxPerSquare = 2;
  }

  resetCanvas(ctx, image);
}

function resetCanvas(ctx, image) {
  window.running = false;
  $("#tracerCheck").attr('checked', false);
  $("#animate").html("Run Simulation");

  window.mesh = new Mesh(ctx, 500/window.pxPerSquare, 200/window.pxPerSquare, image);
  window.mesh.paintCanvas();
}

function initTracers(e) {
  if (e.currentTarget.checked) {
    let nRows = Math.ceil(Math.sqrt(window.mesh.nTracers));
    let dx = window.mesh.xdim / nRows;
    let dy = window.mesh.ydim / nRows;
    let nextX = dx / 2;
    let nextY = dy / 2;
    for (let t = 0; t < window.mesh.nTracers; t++) {
      window.mesh.tracerX[t] = nextX;
      window.mesh.tracerY[t] = nextY;
      nextX += dx;
      if (nextX > window.mesh.xdim) {
        nextX = dx / 2;
        nextY += dy;
      }
    }
  }
  window.mesh.paintCanvas();
}

function simulate() {
  let stepsPerFrame = Number(window.steps);			// number of simulation steps per animation frame
  window.mesh.setBoundaries();

  // Execute a bunch of time steps:
  for (let step = 0; step < stepsPerFrame; step++) {
    window.mesh.collide();
    window.mesh.stream();
    if ($("#tracerCheck")[0].checked) window.mesh.moveTracers();
    window.time++;
  }

  window.mesh.paintCanvas();

  if (window.running) {
    window.stepCount += stepsPerFrame;
    window.setTimeout(() => simulate(), 1);
  }

  let stable = true;
  for (let x = 0; x < window.mesh.xdim; x++) {
    var index = x + (window.mesh.ydim/2)*window.mesh.xdim;	// look at middle row only
    if (window.mesh.rho[index] <= 0) stable = false;
  }

  if (!stable) {
    $("#error").addClass("error-show").removeClass("error");
    animate();
    window.mesh.initFluid();
  }
}
