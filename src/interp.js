
import numeric from 'numeric';

let solve = (x1, y1, x2, y2, x3, y3) => {
  const D = [
    [x1 * x1, x1, 1],
    [x2 * x2, x2, 1],
    [x3 * x3, x3, 1],
  ];
  const dInv = numeric.inv(D);
  return numeric.dot(dInv, [y1, y2, y3]);
};

let sqrInterp = (x1, y1, x2, y2, x3, y3) => {
  let [a,b,c] = solve(x1, y1, x2, y2, x3, y3);
  return (x) => (a*x*x + b*x + c);
};

let sqrtInterp = (x1, y1, x2, y2, x3, y3, sign) => {
  let [a,b,c] = solve(y1, x1, y2, x2, y3, x3);
  return (x) => {
    let d = b*b - 4*a*c + 4*a*x;
    if (d < 0) d = 0;
    else d = Math.sqrt(d)*(sign || 1);
    return (-b + d) / (2*a);
  };
};

export { sqrtInterp, sqrInterp };
