
import React from 'react';
import './App.css';
import { sqrtInterp } from './interp';
import { Input, Examples } from './Input';
import LocalStorageMixin from 'react-localstorage';
import SortTables from './SortTables';
import CardinalCurve from './CardinalCurve';

let runLengthEncode = (s) => {
  let r = [];
  s.split('').forEach((ch) => {
    if (r.length && r[r.length - 1][0] == ch) {
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
      //value: "abzy",
      maxWidth: 600,
      examples: {
        seashells: "she sells seashells by the sea shore",
        woodchuck: "how much wood would a woodchuck chuck if a woodchuck could chuck wood",
        banana: "banana",
        Mississippi: "Mississippi",
        "DNA (50)": "ATTTTTAAGAGAAAAAACTGAAAGTTAATAGAGAGGTGACTCAGATCCAG",
        "DNA (100)": "ATTTTTAAGAGAAAAAACTGAAAGTTAATAGAGAGGTGACTCAGATCCAGAGGTGGAAGAGGAAGGAAGCTTGGAACCCTATAGAGTTGCTGAGTGCCAGG",
      },
      arrowWidthFn: sqrtInterp(100, 100, 200, 150, 400, 200),
      cellDimFn: sqrtInterp(5, 20, 10, 15, 50, 10, -1)
    };
  },

  onChange(e) {
    this.setState({ value: e.target.value });
  },

  render() {
    const value = this.state.value || "";
    const n = value.length + 1;

    let rowStrs = [];
    let rowStrsDict = {};

    for (let r = 0; r < n; r++) {
      let rowStr = value.substr(r) + '$' + value.substr(0, r);
      rowStrsDict[rowStr] = r;
      rowStrs.push(rowStr);
    }

    let sortMappingDict = {};
    let bwt = "";
    let sortedStrs = rowStrs.concat();
    sortedStrs.sort();
    sortedStrs.forEach((sortedStr, sortedIdx) => {
      let origIdx = rowStrsDict[sortedStr];
      sortMappingDict[origIdx] = sortedIdx;
      bwt += sortedStr[n - 1];
    });

    const rlBWT = runLengthEncode(bwt);
    const w = this.state.cellDimFn(n);
    const h = w;
    const fontSize = w;
    const cellsWidth = w * n;
    const cellsHeight = h * n;
    const sortArrowsWidth = this.state.arrowWidthFn(w * n);

    const matricesTailHeight = 20;

    const svgBorder = 0;

    const svgWidth = cellsWidth*2 + sortArrowsWidth + 2*svgBorder;
    const svgHeight = cellsHeight + matricesTailHeight + 2*svgBorder;

    return (
          <div className="all">
            <div className="left">
              <Examples
                    values={this.state.examples}
                    onClick={(name) => this.setState({ value: this.state.examples[name] })}
              />
            </div>
            <div className="main">
              <Input
                    onChange={this.onChange}
                    value={value}
              />
              <div className="svg-container">
                <svg className="svg" width={svgWidth} height={svgHeight}>
                  <g transform={"translate("+svgBorder+","+svgBorder+")"}>
                    <SortTables {...{rowStrs, sortedStrs, w, h, fontSize, sortMappingDict, cellsWidth, sortArrowsWidth}} />
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
