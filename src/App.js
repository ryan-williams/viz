
import React from 'react';
import './App.css';
import { sqrtInterp } from './interp';
import { Input, Examples } from './Input';
import LocalStorageMixin from 'react-localstorage';
import SortTables from './SortTables';
import CardinalCurve from './CardinalCurve';
import { bwt as BWT } from "burrows-wheeler-transform";

let charCmp = (a, b) => {
  if (a === '$') return -1;
  if (b === '$') return 1;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

let strCmp = (a, b) => {
  let i = 0;
  const n = Math.min(a.length, b.length);
  for (; i < n; i++) {
    const chCmp = charCmp(a[i], b[i]);
    if (chCmp !== 0) return chCmp;
  }
  if (a.length < b.length) return -1;
  if (a.length > b.length) return 1;
  return 0;
};

let runLengthEncode = (s) => {
  let r = [];
  s.split('').forEach((ch) => {
    if (r.length && r[r.length - 1][0] === ch) {
      r[r.length - 1][1] += 1;
    } else {
      r.push([ch, 1]);
    }
  });
  return r.map(([ch, num]) => num + ch).join('');
};

let App = React.createClass({

  displayName: 'App',
  mixins: [ LocalStorageMixin ],

  getStateFilterKeys() {
    return [ 'value' ];
  },

  getInitialState() {
    return {
      maxWidth: 600,
      examples: {
        seashells: "she sells seashells sea shells sea",
        woodchuck: "wood would woodchuck chuck woodchuck could chuck wood",
        tomorrow: "Tomorrow and tomorrow and tomorrow",
        banana: "banana",
         "DNA (50)": "ATTTTTAAGAGAAAAAACTGAAAGTTAATAATTTTTAAGAGAAAAAACTG",
        "DNA (100)": "ATTTTTAAGAGAAAAAACTGAAAGTTAATAGAGAGGTGACTCAGATCCAGAGGTGTAAGAGAAAAAACTGAAAGTTAATAGAGAGGTGACTCAGATCCAG",
        pixies: "SIX.MIXED.PIXIES.SIFT.SIXTY.PIXIE.DUST.BOXES",
      },
      arrowWidthFn: sqrtInterp(100, 50, 300, 125, 900, 200),
      cellDimFn: sqrtInterp(5, 20, 10, 15, 50, 10, -1)
    };
  },

  onChange(e) {
    this.setState({ value: e.target.value });
  },

  render() {
    const rawValue = this.state.value || "";
    let value = rawValue.split('').map((ch) => ch === '\n' ? '$' : ch).join('');
    const n = value.length;

    let sortedTables = null;
    let bwt = "";
    if (n <= 111) {
      let rowStrs = [];
      let rowStrsDict = {};

      for (let r = 0; r < n; r++) {
        let rowStr = value.substr(r) + value.substr(0, r);
        rowStrsDict[rowStr] = r;
        rowStrs.push(rowStr);
      }

      let invSortDict = {};
      let sortedStrs = rowStrs.concat();
      sortedStrs.sort(strCmp);
      sortedStrs.forEach((sortedStr, sortedIdx) => {
        let origIdx = rowStrsDict[sortedStr];
        invSortDict[sortedIdx] = origIdx;
        bwt += sortedStr[n - 1];
      });

      const w = this.state.cellDimFn(n);
      const h = w;
      const fontSize = w;
      const cellsWidth = w * n;
      const cellsHeight = h * n;
      const sortArrowsWidth = this.state.arrowWidthFn(w * n);

      const matricesTailHeight = 20;

      const svgBorder = 0;

      const svgWidth = cellsWidth * 2 + sortArrowsWidth + 2 * svgBorder;
      const svgHeight = cellsHeight + matricesTailHeight + 2 * svgBorder;

      sortedTables =
            <div className="svg-container">
              <svg className="svg" width={svgWidth} height={svgHeight}>
                <g transform={"translate("+svgBorder+","+svgBorder+")"}>
                  <SortTables {...{rowStrs, sortedStrs, w, h, fontSize, invSortDict, cellsWidth, sortArrowsWidth}} />
                  <CardinalCurve
                        fromX={svgWidth - w/2}
                        fromY={cellsHeight}
                        toX={w/2}
                        toY={cellsHeight + matricesTailHeight}
                        weight="1"
                        upDown={true}
                        stroke="blue"
                        fill="transparent"
                  />
                </g>
              </svg>
            </div>;
    } else {
      bwt = BWT(value, '$').data;
    }

    const rlBWT = runLengthEncode(bwt);

    return (
          <div className="all">
            <div className="top-row">
              <Examples
                    values={this.state.examples}
                    onClick={(name) => this.setState({ value: this.state.examples[name] })}
              />
              <div className="input-container">
                <Input
                      cols={50}
                      onChange={this.onChange}
                      value={rawValue}
                />
              </div>
              <a className="github" href="https://github.com/ryan-williams/bwt">
                <img width="32" height="32" src="/github.png" alt="GitHub icon" />
              </a>
            </div>
            <div className="viz">
              {sortedTables}
              <div className="bwts">
                <div className="bwt">
                  {bwt}
                </div>
                <div className="bwt">
                  {rlBWT}
                </div>
              </div>
            </div>
          </div>
    );
  },
});

export default App;
