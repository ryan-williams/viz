
import React, { Component } from 'react';

import CardinalCurve from './CardinalCurve';

export default class Brace extends Component {
  render() {
    const { fromX, fromY, toX, toY, upDown, ...rest } = this.props;
    const secondCurve =
          upDown ?
                {
                  toX: fromX + 2 * (toX - fromX),
                  toY: fromY
                } :
                {
                  toX: fromX,
                  toY: fromY + 2 * (toY - fromY)
                };
    return <g>
      <CardinalCurve key={0} {...this.props} />
      <CardinalCurve key={1} {...{ fromX: toX, fromY: toY, upDown }} {...secondCurve} {...rest} />
    </g>
  }
}
