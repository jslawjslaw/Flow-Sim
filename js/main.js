import Mesh from './mesh';

$( () => {
  const canvas = $("#canvas")[0];
  const angle = $("#range")[0];

  canvas.width = 300;
  canvas.height = 300;
  window.stepCount = 0;
  window.startTime = 0;
  window.speed = Number($("#speedValue").text());
  window.steps = 20;
  window.viscosity = 0.02;
  window.contrast = 0;
  window.time = 0;
  window.running = false;
  window.pxPerSquare = 1;

  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(canvas.width, canvas.height);	// faster than clearRect
  for (let i = 3; i < image.data.length; i += 4) {
    image.data[i] = 255;			// set all alpha values to opaque
  }

  const mesh = new Mesh(ctx, Math.ceil(canvas.width/window.pxPerSquare), Math.ceil(canvas.height/window.pxPerSquare), image)

  $("#animate").click(() => animate(mesh));
  $("#angleSlider").change((e) => updateAngle(e, mesh));
  $("#stepSlider").change((e) => resetTimer(e));
  $("#speedSlider").change((e) => adjustSpeed(e));
  $("#viscSlider").change((e) => adjustViscosity(e));
  $("#contrastSlider").change((e) => adjustContrast(e, mesh));
  $("#tracerCheck").change((e) => initTracers(e, mesh));
});

function animate(mesh) {
  window.running = !window.running;
  if (window.running) {
    $("#animate").html("Pause");
    reset();
    simulate(mesh);
  } else {
    $("#animate").html("Run");
  }
}

function updateAngle(e, mesh) {
  $("#angleValue").html(e.currentTarget.value);
  mesh.airfoil.updateAngle(parseInt(e.currentTarget.value));
  mesh.updateBarrier();
  mesh.paintCanvas();
}

function adjustSpeed(e) {
  $("#speedValue").html(e.currentTarget.value);
  window.speed = e.currentTarget.value;
}

function adjustViscosity(e) {
  $("#viscValue").html(e.currentTarget.value);
  window.viscosity = Number(e.currentTarget.value);
}

function reset() {
  window.stepCount = 0;
  window.startTime = (new Date()).getTime();
}

function resetTimer(e) {
  $("#stepValue").html(e.currentTarget.value);
  window.steps = Number(e.currentTarget.value);
  reset();
}

function adjustContrast(e, mesh) {
  $("#contrastValue").html(e.currentTarget.value);
  window.contrast = Number(e.currentTarget.value);
  mesh.paintCanvas();
}

function initTracers(e, mesh) {
  if (e.currentTarget.checked) {
    let nRows = Math.ceil(Math.sqrt(mesh.nTracers));
    let dx = mesh.xdim / nRows;
    let dy = mesh.ydim / nRows;
    let nextX = dx / 2;
    let nextY = dy / 2;
    for (let t = 0; t < mesh.nTracers; t++) {
      mesh.tracerX[t] = nextX;
      mesh.tracerY[t] = nextY;
      nextX += dx;
      if (nextX > mesh.xdim) {
        nextX = dx / 2;
        nextY += dy;
      }
    }
  }
  mesh.paintCanvas();
}

function simulate(mesh) {
  let stepsPerFrame = Number(window.steps);			// number of simulation steps per animation frame
  mesh.setBoundaries();

  // Execute a bunch of time steps:
  for (let step = 0; step < stepsPerFrame; step++) {
    mesh.collide();
    mesh.stream();
    if ($("#tracerCheck")[0].checked) mesh.moveTracers();
    window.time++;
  }

  mesh.paintCanvas();

  if (window.running) {
    window.stepCount += stepsPerFrame;
    window.setTimeout(() => simulate(mesh), 1);
  }

  let stable = true;
  for (let x = 0; x < mesh.xdim; x++) {
    var index = x + (mesh.ydim/2)*mesh.xdim;	// look at middle row only
    if (mesh.rho[index] <= 0) stable = false;
  }

  if (!stable) {
    window.alert("The simulation has become unstable due to excessive fluid speeds.");
    animate(mesh);
    mesh.initFluid();
  }
}
