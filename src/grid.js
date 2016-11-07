
import React from 'react';
import _ from 'underscore';

import CardinalCurve from './CardinalCurve';
import Brace from './brace';
import Arrow from './Arrow';
import Translate from './translate';
import { rand } from './random';
import './grid.css';
import { SvgCells } from './SortTables';
import { M, C as CB } from './path';

let add = (a,b) => a+b;
let sum = (arr) => arr.length ? arr.reduce(add) : 0;

const PrefixSum = React.createClass({
  getInitialState() {
    const w = 3, h = 3, W = 3, H = 3;
    const data =
          _.range(H).map((R) =>
            _.range(W).map((C) =>
              _.range(h).map((r) =>
                _.range(w).map((c) =>
                  rand(2) ? 0 : rand(10)
                )
              )
            )
          );

    const cellW = 30;
    const cellH = 20;
    const padX = 5;
    const padY = 5;
    const extraPadX = padX + cellW;
    const extraPadY = padY + cellH*1.5;
    const braceWidth = 10;

    const partitionCDF =
          data.map((gridRow, R) =>
                gridRow.map((grid) => {
                  let summedGrid = grid.map((row) => row.concat());
                  _.range(h).forEach((r) => {
                    _.range(w - 1, -1, -1).forEach((c) => {
                      summedGrid[r][c] = grid[r][c];
                      if (r > 0) {
                        summedGrid[r][c] += summedGrid[r-1][c];
                      }
                      if (c + 1 < w) {
                        summedGrid[r][c] += summedGrid[r][c+1];
                      }
                      if (r > 0 && c + 1 < w) {
                        summedGrid[r][c] -= summedGrid[r-1][c+1];
                      }
                    })
                  });
                  return summedGrid;
                })
          );

    const CDF =
          partitionCDF.map((cdfRow, R) =>
            cdfRow.map((grid, C) => {

              let colSumsAbove =
                    _.range(w).map((c) =>
                          sum(_.range(R).map((UR) =>
                                partitionCDF[UR][C][h - 1][c]
                          ))
                    );

              let rowSumsRight =
                    _.range(h).map((r) =>
                          sum(
                                _.range(C + 1, W).map((RC) =>
                                  partitionCDF[R][RC][r][0]
                                )
                          )
                    );

              let diagSum =
                    sum(_.range(0, R).map((UR) =>
                      sum(_.range(C+1, W).map((RC) =>
                        partitionCDF[UR][RC][h - 1][0]
                      ))
                    ));

              return grid.map((row, r) =>
                    row.map((v, c) =>
                          partitionCDF[R][C][r][c] + diagSum + colSumsAbove[c] + rowSumsRight[r]
                    )
              );
            })
          );

    return {
      data, w, h, W, H, cellW, cellH, padX, padY, braceWidth,
      drawArrows: false,
      label: "Given a distributed 2D-array, perform a 2D-prefix sum…",
      highlightCol: -1, highlightRow: -1,
      stepIdx: -1,
      steps: [
        {
          data: partitionCDF,
          label: "Prefix-sum within each partition",
        },
        {
          highlightCol: 0,
          highlightRow: data.length - 1,
          label: "Each partition will emit its left col, bottom row, and bottom-left elem to other partitions left, below, and below-left of it, respectively"
        },
        {
          padX: extraPadX,
          padY: extraPadY
        },
        {
          drawArrows: true,
          label: "Click and hold a partition to see only the counts it will send to other partitions"
        },
        {
          data: CDF,
          drawArrows: false,
          highlightCol: -1,
          highlightRow: -1,
          label: "Each partition collects and incorporates partial-sums sent to it by other partitions"
        },
        {
          padX,
          padY
        }
      ],
      prevSteps: []
    }
  },

  render() {
    const { data, w, h, W, H, cellW, cellH, padX, padY, highlightCol, highlightRow, drawArrows, braceWidth, label, stepIdx, steps } = this.state;

    return <div onKeyDown={this.onKeyPress}>
      <div className="controls">
        <input type="button" onClick={this.prev} value="Prev" disabled={stepIdx === -1}/>
        <input type="button" onClick={this.next} value="Next" disabled={stepIdx + 1 === steps.length}/>
        <div className="label">{(stepIdx + 1) + ": " + label}</div>
      </div>
      <svg height={H*(h*cellH + padY)} width={W*(w*cellW + padX)}>
        <defs>
          <marker id="Triangle"
                  viewBox="0 0 10 10"
                  refX="10"
                  refY="5"
                  markerUnits="strokeWidth"
                  markerWidth="6" markerHeight="6"
                  orient="auto">
            <path className="head" d="M0,0 L10,5 L0,10 z" />
          </marker>
        </defs>
        <Translate  y={padY/2 + 1}>
          <Grids {...{
            data, w, h, W, H, padX, padY, cellW, cellH, highlightCol, highlightRow, drawArrows, braceWidth
          }} />
        </Translate>
      </svg>
    </div>;
  },

  onKeyPress(e) {
    console.log(e.charCode);
  },

  prev(e) {
    let { stepIdx, prevSteps } = this.state;
    stepIdx--;
    prevSteps = prevSteps.concat();
    let prevState = prevSteps.pop();
    console.log("prev:", stepIdx, prevState);
    this.setState({ stepIdx, prevSteps, ...prevState });
  },

  next(e) {
    let { stepIdx, steps, prevSteps, ...rest } = this.state;
    stepIdx++;
    const newState = steps[stepIdx];
    console.log("next:", stepIdx, newState);
    prevSteps = prevSteps.concat();
    prevSteps.push(rest);
    this.setState({ stepIdx, prevSteps, ...newState });
  }
});

let Grids = React.createClass({
  getInitialState() {
    return {};
  },

  onMouseDown(e, ui, R, C) {
    console.log(R, C);
    e.stopPropagation();
    e.preventDefault();
    this.setState({
      selectedR: R,
      selectedC: C
    });
  },

  render() {
    let { w, h, H, padX, padY, cellW, cellH, data, drawArrows, braceWidth } = this.props;
    const { selectedR, selectedC } = this.state;
    let gridHeight = h*cellH, gridWidth = w*cellW;
    const grids =
          data.map((gridRow, R) =>
                gridRow.map((grid, C) => {
                  let arrows = [];
                  if (drawArrows) {
                    if (C > 0) {
                      arrows.push(
                        <Arrow
                              key="left"
                              fromX={-braceWidth}
                              fromY={gridHeight/2}
                              toX={-padX}
                              toY={gridHeight/2}
                        />
                      );
                    }
                    if (R + 1 < H) {
                      arrows.push(
                            <Arrow
                                  key="down"
                                  className="arrow"
                                  fromX={gridWidth/2}
                                  fromY={gridHeight + braceWidth}
                                  toX={gridWidth/2}
                                  toY={gridHeight + padY}
                            />
                      );
                    }
                    if (C > 0 && R + 1 < H) {
                      arrows.push(
                            <Arrow
                                  key="diag"
                                  fromX={0}
                                  fromY={gridHeight}
                                  toX={-padX}
                                  toY={gridHeight + padY}
                            />
                      );
                    }
                    if (C > 1) {
                      arrows.push(
                            <CardinalCurve
                                  key="left-2"
                                  className="arrow"
                                  points={[
                                        [ -braceWidth, gridHeight / 2 ],
                                        [ -padX - braceWidth, -padY / 2 ],
                                        [ -padX - gridWidth + braceWidth, -padY / 2 ],
                                        [ -padX - gridWidth - padX, gridHeight / 2 ]
                                  ]}
                            />
                      )
                    }
                    if (R + 2 < H) {
                      arrows.push(
                            <CardinalCurve
                                  key="down-2"
                                  className="arrow"
                                  upDown={true}
                                  points={[
                                        [ gridWidth / 2, gridHeight + braceWidth ],
                                        [ gridWidth + padX/2, gridHeight + padY + braceWidth ],
                                        [ gridWidth + padX/2, gridHeight + padY + gridHeight - braceWidth ],
                                        [ gridWidth / 2, gridHeight*2 + padY*2 ]
                                  ]}
                            />
                      )
                    }
                    if (C > 1 && R + 1 < H) {
                      const flatY = gridHeight + padY/2;
                      arrows.push(
                            <CardinalCurve
                                  key="left-2-down-1"
                                  className="arrow"
                                  prefix={
                                    M(0, gridHeight) +
                                    CB(
                                          -padX, flatY,
                                          -padX - gridWidth / 2, flatY,
                                          -padX - gridWidth + braceWidth, flatY
                                    )
                                  }
                                  points={[
                                        [ -padX - gridWidth + braceWidth, flatY ],
                                        [ -padX - gridWidth - padX, gridHeight + padY + gridHeight/2 ]
                                  ]}
                            />
                      );
                    }
                    if (C > 0 && R + 2 < H) {
                      const flatX = -padX/2;
                      arrows.push(
                            <CardinalCurve
                                  key="left-1-down-2"
                                  className="arrow"
                                  upDown={true}
                                  prefix={
                                    M(0, gridHeight) +
                                    CB(
                                          flatX, gridHeight + padY,
                                          flatX, gridHeight + padY + gridHeight/2,
                                          flatX, gridHeight + padY + gridHeight - braceWidth
                                    )
                                  }
                                  points={[
                                        [ flatX, gridHeight + padY + gridHeight - braceWidth ],
                                        [ -padX - gridWidth/2, 2*(gridHeight+padY) ]
                                  ]}
                            />
                      );
                    }
                    if (C > 1 && R + 2 < H) {
                      const flatY = gridHeight + padY/2;
                      const flatX = -padX - gridWidth - padX/2;
                      arrows.push(
                            <path
                                  key="diag-2"
                                  className="arrow"
                                  d={
                                    M(0, gridHeight) +
                                    CB(
                                          -padX, flatY,
                                          -padX - gridWidth / 2, flatY,
                                          -padX - gridWidth + braceWidth, flatY
                                    ) +
                                    CB(
                                          flatX, flatY,
                                          flatX, flatY,
                                          flatX, gridHeight + padY + braceWidth
                                    ) +
                                    CB(
                                          flatX, gridHeight + padY + gridHeight/2,
                                          flatX, 2*gridHeight + padY,
                                          -2*padX - gridWidth, 2*(gridHeight + padY)
                                    )
                                  }
                            />
                      );
                    }
                  }

                  let className = "";
                  if (selectedR !== undefined) {
                    if (R === selectedR && C === selectedC) {
                      className = "selected";
                    } else {
                      className = "masked";
                    }
                  }

                  return <Translate className={className} x={C * (gridWidth + padX)} y={R * (gridHeight + padY)}>
                      <Grid
                            {...{grid, R, C}}
                            {...this.props}
                            onMouseDown={(e, ui) => this.onMouseDown(e, ui, R, C)}
                      />
                      {arrows}
                    </Translate>
                  ;
                })
          );

    return <g onClick={this.clearSelection}>{grids}</g>
  },

  clearSelection() {
    console.log("clear");
    this.setState({
      selectedR: undefined,
      selectedC: undefined
    })
  }
});

let Grid = React.createClass({
  render() {
    let { grid, R, C, w, h, W, cellW, cellH, highlightCol, highlightRow, drawArrows, braceWidth, onMouseDown } = this.props;
    let curves = [];
    if (drawArrows) {
      if (C > 0) {
        curves.push(
              <Brace
                    key="left-brace"
                    fromX={0}
                    fromY={0}
                    toX={-braceWidth}
                    toY={cellH * h / 2}
              />
        );
      }
      if (R + 1 < W) {
        curves.push(
              <Brace
                    key="bottom-brace"
                    fromX={0}
                    fromY={cellH * h}
                    toX={cellW * w / 2}
                    toY={cellH * h + braceWidth}
                    upDown={true}
              />
        );
      }
    }
    return <g>
      <SvgCells
            key={R + "," + C}
            rows={grid}
            w={cellW}
            h={cellH}
            fontSize={14}
            {...{highlightCol, highlightRow, onMouseDown}}
      />
      {curves}
    </g>;
  }
});

export default PrefixSum;
