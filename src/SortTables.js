
import React, { Component } from 'react';
import Arrows from './Arrows';

class SortTables extends Component {
  render() {
    const { w, h, fontSize, rowStrs, sortedStrs, sortMappingDict, cellsWidth, sortArrowsWidth } = this.props;
    const n = rowStrs.length;
    return <g className="sort-tables-row">
      <SvgCells name="suffixes" {...{w, h, fontSize, rowStrs}} />
      <g className="arrows-container" transform={"translate(" + cellsWidth + ",0)"}>
        <Arrows {...{sortMappingDict, width: sortArrowsWidth, h}} />
      </g>
      <g className="cells-container" transform={"translate(" + (cellsWidth + sortArrowsWidth) + ",0)"}>
        <SvgCells name="sorted-suffixes" {...{ w, h, fontSize, rowStrs: sortedStrs, highlightCol: n-1 }} />
      </g>
    </g>;
  }
}

class SvgCells extends Component {
  render() {
    const { w, h, rowStrs, fontSize, highlightCol } = this.props;

    const n = rowStrs.length;

    let cells = [];
    rowStrs.forEach((rowStr, r) => {
      let masking = false;
      rowStr.split('').forEach((ch, c) => {
        let className =
              (c === highlightCol) ?
                    "highlighted" :
                    (masking ?
                          "masked" :
                          ""
                    );
        cells.push(
              <text
                    key={r+","+c}
                    x={w*(c+.5)}
                    y={h*(r+.5)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={fontSize}
                    className={className}
              >
                {ch}
              </text>
        );
        if (ch === '$') {
          masking = true;
        }
      });
    });
    return <g className={['letters'].concat([this.props.name] || []).join(' ')}>
      {cells}
      <rect stroke="black" fill="transparent" x="0" y="0" width={n * w} height={n * h} />
    </g>;
  }
}

export default SortTables;
