
import _ from 'underscore';
import React, { Component } from 'react';
import './App.css';
import numeric from 'numeric';

let solve = (x1, y1, x2, y2, x3, y3) => {
  const D = [
    [x1 * x1, x1, 1],
    [x2 * x2, x2, 1],
    [x3 * x3, x3, 1],
  ];
  const dInv = numeric.inv(D);
  return numeric.dot(dInv, [y1, y2, y3]);
};

let sqrInterp = (x1, y1, x2, y2, x3, y3) => {
  let [a,b,c] = solve(x1, y1, x2, y2, x3, y3);
  return (x) => (a*x*x + b*x + c);
};

let sqrtInterp = (x1, y1, x2, y2, x3, y3, sign) => {
  let [a,b,c] = solve(y1, x1, y2, x2, y3, x3);
  return (x) => {
    let d = b*b - 4*a*c + 4*a*x;
    if (d < 0) d = 0;
    else d = Math.sqrt(d)*(sign || 1);
    return (-b + d) / (2*a);
  };
};

let App = React.createClass({

  getInitialState() {
    return {
      value: "abzy",
      maxWidth: 600,
      examples: {
        Seashells: "she sells seashells by the sea shore"
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
    const fontSize = 15;
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

class Input extends Component {
  render() {
    return <textarea className="input" cols="50" rows="4" {...this.props} />;
  }
}

class Examples extends Component {
  render() {
    return <div className="examples">
      <div>Examples:</div>
      {
        _.map(
            this.props.values,
            (value, name) =>
                  <div key={name} className="example">
                    <a href="#" onClick={(e) => this.props.onClick(name)}>
                      {name}
                    </a>
                  </div>
        )
      }
    </div>
  }
}

// eslint-disable-next-line
class Table extends Component {
  render() {
    return <table className={['table'].concat([this.props.name] || []).join(' ')}>
      <tbody>
        {
          this.props.rowStrs.map(
                (rowStr,r) =>
                      <tr key={r}>
                        {
                          rowStr.split('').map(
                                (ch,c) =>
                                      <td key={c}>{ch}</td>
                          )
                        }
                      </tr>
          )
        }
      </tbody>
    </table>
  }
}

class SortTables extends Component {
  render() {
    const { w, h, fontSize, rowStrs, sortedStrs, sortMappingDict, cellsWidth, sortArrowsWidth } = this.props;
    const n = rowStrs.length;
    return <g>
      <SvgCells name="suffixes" {...{w, h, fontSize, rowStrs}} />
      <g transform={"translate(" + cellsWidth + ",0)"}>
        <Arrows {...{sortMappingDict, width: sortArrowsWidth, h}} />
      </g>
      <g transform={"translate(" + (cellsWidth + sortArrowsWidth) + ",0)"}>
        <SvgCells name="sorted-suffixes" {...{w, h, fontSize, rowStrs: sortedStrs}} />
      </g>
    </g>;
  }
}

class SvgCells extends Component {
  render() {
    const { w, h, rowStrs, fontSize } = this.props;

    const n = rowStrs.length;

    let cells = [];
    rowStrs.forEach((rowStr, r) => {
      let masking = false;
      rowStr.split('').forEach((ch, c) => {
        cells.push(
              <text
                    key={r+","+c}
                    x={w*(c+.5)}
                    y={h*(r+.5)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    //fontFamily="monospace"
                    fontSize={fontSize}
                    className={masking ? "masked" : ""}
              >
                {ch}
              </text>
        );
        if (ch == '$') {
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
                  d={"M0," + ((parseInt(from)+.5) * h) + " L" + width + "," + ((parseInt(to)+.5)*h)}
            />
      );
    });
    return <g className="arrows">{arrows}</g>;
  }
}

export default App;
