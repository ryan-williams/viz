
import React, { Component } from 'react';

let interp = (from, to, weight) => (from + weight * (to - from));

class CardinalCurve extends Component {
  render() {
    let { fromX, fromY, toX, toY, upDown, weight, ...rest } = this.props;
    upDown = !!upDown;
    weight = weight || .5;
    const [ c1x, c1y, c2x, c2y ] =
          upDown ?
                [
                  fromX,
                  interp(fromY, toY, weight),
                  toX,
                  interp(toY, fromY, weight)
                ]
                :
                [
                  interp(fromX, toX, weight),
                  fromY,
                  interp(toX, fromX, weight),
                  toY
                ];
    // console.log(fromX,fromY, c1x,c1y, c2x,c2y, toX,toY);
    return <path
          d={"M" + fromX + " " + fromY + " C " + c1x + " " + c1y + ", " + c2x + " " + c2y + ", " + toX + " " + toY}
          {...rest}
    />;
  }
}

export default CardinalCurve;
