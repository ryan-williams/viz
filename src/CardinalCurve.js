
import React, { Component } from 'react';

import { M, C } from './path';

let interp = (from, to, weight) => (from + weight * (to - from));

class CardinalCurve extends Component {
  render() {
    let { fromX, fromY, toX, toY, upDown, weight, points, prefix, ...rest } = this.props;
    upDown = !!upDown;

    if (!points) {
      points = [ [toX, toY] ];
    }

    prefix = prefix || "";

    if (fromX === undefined || fromY === undefined) {
      // If no hard-coded start point is provided, use the first element from points.

      if (fromX !== undefined || fromY !== undefined) {
        throw new Error("fromX and fromY must both be defined or undefined");
      }
      [ fromX, fromY ] = points[0];
      points = points.slice(1);
    }

    let pathSegments = [ M(fromX, fromY) ];

    weight = weight || 1;

    points.forEach(([x, y]) => {
      const [ c1x, c1y, c2x, c2y ] =
            upDown ?
                  [
                    fromX,
                    interp(fromY, y, weight),
                    x,
                    interp(y, fromY, weight)
                  ]
                  :
                  [
                    interp(fromX, x, weight),
                    fromY,
                    interp(x, fromX, weight),
                    y
                  ];

      fromX = x;
      fromY = y;
      pathSegments.push(C(c1x, c1y, c2x, c2y, x, y));
    });

    return <path
          d={prefix + " " + pathSegments.join('')}
          {...rest}
    />;
  }
}

export default CardinalCurve;
