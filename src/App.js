
import React from 'react';
import './App.css';
import { sqrtInterp } from './interp';
import { Input, Examples } from './Input';
import LocalStorageMixin from 'react-localstorage';
import SortTables from './SortTables';

let App = React.createClass({

  displayName: 'App',
  mixins: [ LocalStorageMixin ],

  getStateFilterKeys() {
    return [ 'value' ];
  },

  getInitialState() {
    return {
      value: "abzy",
      maxWidth: 600,
      examples: {
        seashells: "she sells seashells by the sea shore",
        woodchuck: "how much wood would a woodchuck chuck if a woodchuck could chuck wood",
        banana: "banana",
        Mississippi: "Mississippi",
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
      // let rowStr = value.substr(r);
      rowStrsDict[rowStr] = r;
      rowStrs.push(rowStr);
    }

    let sortMappingDict = {};
    let sortedStrs = rowStrs.concat();
    sortedStrs.sort();
    sortedStrs.forEach((sortedStr, sortedIdx) => {
      let origIdx = rowStrsDict[sortedStr];
      sortMappingDict[origIdx] = sortedIdx;
    });

    const w = this.state.cellDimFn(n);
    const h = w;
    const fontSize = w;
    const cellsWidth = w * n;
    const cellsHeight = h * n;
    const sortArrowsWidth = this.state.arrowWidthFn(w * n);

    const svgBorder = 0;

    return (
      <div className="all">
        <Input
              onChange={this.onChange}
              value={value}
        />
        <Examples
              values={this.state.examples}
              onClick={(name) => this.setState({ value: this.state.examples[name] })}
        />
        <div className="svg-container">
          <svg className="svg" width={cellsWidth*2 + sortArrowsWidth + 2*svgBorder} height={cellsHeight + 2*svgBorder}>
            <g transform={"translate("+svgBorder+","+svgBorder+")"}>
              <SortTables {...{rowStrs, sortedStrs, w, h, fontSize, sortMappingDict, cellsWidth, sortArrowsWidth}} />
            </g>
          </svg>
        </div>
      </div>
    );
  },
});

export default App;
