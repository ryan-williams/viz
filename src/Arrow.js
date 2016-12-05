
import React, { Component } from 'react';

import { M, L } from './path';

export default class Arrow extends Component {
  render() {
    let { fromX, fromY, toX, toY, ...rest } = this.props;
    return <path
          key="stem"
          className="arrow"
          d={M(fromX, fromY) + L(toX, toY)}
          markerEnd="url(#Triangle)"
          {...rest}
    />;
  }
}
