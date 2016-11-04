
import React, { Component } from 'react';

import { M, L } from './path';

// const { sqrt, min } = Math;

export default class Arrow extends Component {
  render() {
    let { fromX, fromY, toX, toY, ...rest } = this.props;
    // const dx = toX - fromX, dy = toY - fromY;
    // const len = sqrt(dx*dx + dy*dy);
    // head = head || min(10, len);
    // const r = head / len * sqrt(3) / 2;
    // const r2 = head / len / 2;
    // const mx = toX + (fromX - toX) * r, my = toY + (fromY - toY) * r;
    return <path
          key="stem"
          className="arrow"
          d={M(fromX, fromY) + L(toX, toY)}
          markerEnd="url(#Triangle)"
          {...rest}
    />;
  }
}
