
const p = (x, y) => x + "," + y;

const M = (x, y) => "M" + p(x, y) + " ";
const L = (x, y) => "L" + p(x, y) + " ";
const H = (x) => "H" + x + " ";
const V = (y) => "V" + y + " ";
const C = (c1x, c1y, c2x, c2y, toX, toY) => "C" + [ p(c1x, c1y), p(c2x, c2y), p(toX, toY) ].join(' ') + ' ';

export { M, L, H, V, C };
