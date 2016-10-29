
import React, { Component } from 'react';
import _ from 'underscore';
import CardinalCurve from './CardinalCurve';

class Arrows extends Component {
  render() {
    const {sortMappingDict, width, h} = this.props;
    return <g className="arrows">
      {
        _.map(
              sortMappingDict,
              (to, from) =>
                    <Curve key={from} {...{ width, h, from, to }} />
        )
      }
    </g>;
  }
}

// eslint-disable-next-line
class Line extends Component {
  render() {
    const { width, h, from, to } = this.props;
    const fromX = 0, fromY = h * (parseInt(from, 10)+.5);
    const toX = width, toY = h * (parseInt(to, 10)+.5);
    return <path
          className="arrow"
          stroke="red"
          d={"M" + fromX + "," + fromY + " L" + toX + "," + toY}
    />;
  }
}

// eslint-disable-next-line
class Curve extends Component {
  render() {
    const { width, h, from, to } = this.props;
    return <CardinalCurve
          className="arrow"
          stroke="red"
          fill="transparent"
          fromX={0}
          fromY={h * (parseInt(from, 10)+.5)}
          toX={width}
          toY={h * (parseInt(to, 10)+.5)}
    />;
  }
}

export default Arrows;
