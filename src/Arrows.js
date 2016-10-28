
import React, { Component } from 'react';
import _ from 'underscore';

class Arrows extends Component {
  render() {
    const {sortMappingDict, width, h} = this.props;
    let arrows = [];
    _.forEach(sortMappingDict, (to, from) => {
      arrows.push(
            <path
                  className="arrow"
                  stroke="red"
                  key={from}
                  d={"M0," + ((parseInt(from, 10)+.5) * h) + " L" + width + "," + ((parseInt(to, 10)+.5)*h)}
            />
      );
    });
    return <g className="arrows">{arrows}</g>;
  }
}

export default Arrows;
