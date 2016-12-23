function multiply(A, B) {
  if (canMultiply(A, B)) {
    let out = [];
    for(let i = 0; i < A.length; i++) {
      let sum = 0;
      for(let j = 0; j < A[0].length; j++) {
        sum = sum + (A[i][j] * B[j]);
      }
      out.push(sum);
    }

    return out;
  }

  function canMultiply(A, B) {
    if (A[0].length === B.length) {
      return true;
    } else {
      return false;
    }
  }
}

function rotation(theta) {
  return [
    [Math.cos(theta), -1*Math.sin(theta)],
    [Math.sin(theta), Math.cos(theta)]
  ];
}

function subtract(A, B) {
  let out = [];
  for(let i = 0; i < A.length; i++) {
    out.push([A[i][0] - B[0], A[i][1] - B[1]]);
  }

  return out;
}

function add(A, B) {
  let out = [];
  for(let i = 0; i < A.length; i++) {
    out.push([A[i][0] + B[0], A[i][1] + B[1]]);
  }

  return out;
}

function degToRads(deg) {
  return deg * Math.PI/180;
}

export { multiply, rotation, subtract, add, degToRads };
