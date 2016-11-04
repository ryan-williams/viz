
import React, { Component } from 'react';
import Arrows from './Arrows';
import _ from 'underscore';
import { sqrtInterp } from './interp';
import { M, H, V } from './path';

class SortTables extends Component {
  render() {
    const { w, h, fontSize, rowStrs, sortedStrs, invSortDict, cellsWidth, sortArrowsWidth } = this.props;
    const n = rowStrs.length;
    return <g className="sort-tables-row">
      <SvgCells
            name="suffixes"
            {
              ...{
                w, h, fontSize, rowStrs,
                masksDict: _.range(0, n)
              }
            }
      />
      <g className="arrows-container" transform={"translate(" + cellsWidth + ",0)"}>
        <Arrows {...{invSortDict, width: sortArrowsWidth, h}} />
      </g>
      <g className="cells-container" transform={"translate(" + (cellsWidth + sortArrowsWidth) + ",0)"}>
        <SvgCells
              name="sorted-suffixes"
              {
                ...{
                  w, h, fontSize,
                  masksDict: invSortDict,
                  rowStrs: sortedStrs,
                  highlightCol: n-1
                }
              }
        />
      </g>
    </g>;
  }
}

let SvgCells = React.createClass({
  getInitialState() {
    return {
      cellDimFn: sqrtInterp(5, 20, 10, 15, 50, 10, -1)
    }
  },

  render() {
    let { w, h, rowStrs, rows, fontSize, highlightCol, highlightRow, masksDict, hLines, vLines } = this.props;

    hLines = hLines || [];
    vLines = vLines || [];

    if (!rows) {
      rows = rowStrs.map((rowStr) => rowStr.split(''));
    }
    const n = rows.length;

    if (!w || !h || !fontSize) {
      w = this.state.cellDimFn(n);
      h = w;
      fontSize = w;
    }

    let cells = [];
    rows.forEach((row, r) => {
      let masking = false;
      row.forEach((ch, c) => {
        let lastCol = false;
        if (masksDict && (r in masksDict)) {
          if (c + masksDict[r] === n) {
            masking = true;
          } else if (c + 1 + masksDict[r] === n) {
            console.log("last:", r, c, masksDict[r], n);
            lastCol = true;
          }
        }
        let className =
              lastCol ? "last" : (
              (c === highlightCol || r === highlightRow) ?
                    "highlighted" :
                    (masking ?
                          "masked" :
                          ""
                    )
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
      });
    });

    const highlightColRec =
          highlightCol === undefined ?
                null :
                <rect
                      className="highlight-col"
                      x={highlightCol * w}
                      y="1"
                      width={w - 1}
                      height={n * h - 2}
                />;

    const highlightRowRec =
          highlightRow === undefined ?
                null :
                <rect
                      className="highlight-row"
                      x={1}
                      y={highlightRow * h}
                      width={n * w - 1}
                      height={h - 1}
                />;

    const highlightRowColRec =
          (highlightCol === undefined || highlightRow === undefined) ?
                null :
                <rect
                      className="highlight-row-col"
                      x={highlightCol * w}
                      y={highlightRow * h}
                      width={w - 1}
                      height={h - 1}
                />;

    let lines = [];
    lines = lines.concat(hLines.map((y) => <path key={"h" + y} d={M(0, y*h) + H(w * n)} />));
    lines = lines.concat(vLines.map((x) => <path key={"v" + x} d={M(x*w, 0) + V(h * n)} />));

    return <g className={['letters'].concat([this.props.name] || []).join(' ')}>
      {highlightColRec}
      {highlightRowRec}
      {highlightRowColRec}
      {cells}
      {lines}
      <rect stroke="black" fill="transparent" x="0" y="0" width={n * w} height={n * h} />
    </g>;
  }
});

export default SortTables;
export { SvgCells };
