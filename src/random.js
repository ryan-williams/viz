import seedrandom from 'seedrandom';

export const random = seedrandom(8);

export const rand = (n) => parseInt(random() * n, 10);
