
import React, { Component } from 'react';
import Arrows from './Arrows';
import Translate from './translate';
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
    let {
          w, h,
          rowStrs,
          rows,
          fontSize,
          highlightCol, highlightRow,
          masksDict,
          hLines, vLines,
          cellMouseEnterFn,
          selectRect,
          renderFn,
          attrsFn
    } = this.props;

    if (highlightCol < 0) highlightCol = undefined;
    if (highlightRow < 0) highlightRow = undefined;

    hLines = hLines || [];
    vLines = vLines || [];

    if (!rows) {
      rows = rowStrs.map((rowStr) => rowStr.split(''));
    }

    const m = rows ? rows.length : 0
    const n = rows ? rows[0].length : 0;

    if (!w || !h || !fontSize) {
      w = this.state.cellDimFn(n);
      h = w;
      fontSize = w;
    }

    let cells = [];
    rows.forEach((row, r) => {
      let masking = false;
      row.forEach((ch, c) => {

        const label = renderFn && renderFn(r, c, ch) || ch;

        const attrs = attrsFn && attrsFn(r, c, ch) || {};

        const backgroundRect =
              attrs.backgroundClass ?
                    <rect
                          x={0} y={0}
                          width={w} height={h}
                          className={attrs.backgroundClass}
                    /> :
                    null;

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
              <Translate
                    key={r + "-" + c}
                    className="cell"
                    x={w * c}
                    y={h * r}
              >
                {backgroundRect}
                <text
                      x={w / 2}
                      y={h / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={fontSize}
                      className={className}
                      {...attrs}
                >
                  {label}
                </text>
                <rect
                      x={0} y={0}
                      width={w} height={h}
                      fill="transparent"
                      onMouseEnter={cellMouseEnterFn && cellMouseEnterFn(r, c)}
                />
              </Translate>
        );
      });
    });

    const selectRec =
          !selectRect ?
                null :
                <rect
                  className="select-rect"
                  x={selectRect.c * w}
                  y={1}
                  width={(n - selectRect.c) * w - 1}
                  height={(selectRect.r + 1) * h - 2}
                />;

    const highlightColRec =
          highlightCol === undefined ?
                null :
                <rect
                      className="highlight-col"
                      x={highlightCol * w}
                      y="1"
                      width={w - 1}
                      height={m * h - 2}
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
    lines = lines.concat(vLines.map((x) => <path key={"v" + x} d={M(x*w, 0) + V(h * m)} />));

    return <g
          onMouseDown={this.onMouseDown}
          className={['letters'].concat([this.props.name] || []).join(' ')}>
      <rect
            stroke="black"
            fill="transparent"
            x="0" y="0"
            width={n * w} height={m * h}
      />
      {selectRec}
      {highlightColRec}
      {highlightRowRec}
      {highlightRowColRec}
      {cells}
      {lines}
    </g>;
  },
  onMouseDown(e, ui) {
    if (this.props.onMouseDown) {
      this.props.onMouseDown(e, ui);
    }
  }
});

export default SortTables;
export { SvgCells };
