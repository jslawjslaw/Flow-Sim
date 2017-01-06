let convex = [];

for (let x = 0.25; x > 0; x -= 0.01) {
  convex.push([x, -Math.sqrt((x - 2*Math.pow(x,2)/2))]);
}

for (let x = 0; x < 0.25; x += 0.01) {
  convex.push([x, Math.sqrt((x - 2*Math.pow(x,2)/2))]);
}

for (let k = 0.25; k > 0.05; k -= 0.005) {
  convex.push([k, (1/20)*Math.sqrt(-200*Math.pow(k,2) + 240*k - 11)]);
}

for (let k = 0.05; k < 0.25; k += 0.005) {
  convex.push([k, -(1/20)*Math.sqrt(-200*Math.pow(k,2) + 240*k - 11)]);
}


module.exports = convex;
