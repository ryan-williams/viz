
import React, { Component } from 'react';

export default class Translate extends Component {
  render() {
    const { x, y, children, ...rest } = this.props;
    return <g
          transform={"translate(" + (x||0) + "," + (y||0) + ")"}
          {...rest}
    >
      {children}
    </g>;
  }
}
