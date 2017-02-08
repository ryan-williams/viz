
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
    const w = 6, h = 5, W = 3, H = 3;
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
    const padX = cellW + 5;
    const padY = cellH + 5;
    const braceWidth = 10;
    let fontSize = 14;
    let yLabelWidth = cellW + 5;
    let xLabelHeight = cellH + 7;

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
      data, w, h, W, H, cellW, cellH, padX, padY, braceWidth, fontSize, yLabelWidth, xLabelHeight, partitionCDF, CDF,
      drawArrows: false,
      selectOnMouseOver: true,
      label:
            <div>
              <div>
                Given a distributed (maybe sparse) 2D-array, perform a 2D-prefix sum:
              </div>
              <div>
                Replace each element with the sum of all elements at higher row- and column-coordinates.
              </div>
              <div>
                Each element is keyed – and the collection partitioned upstream – by its coordinates, which are only
                shown along the sides here, to reduce clutter.
              </div>
            </div>,
      highlightCol: -1, highlightRow: -1,
      stepIdx: -1,
      steps: [
        {
          data: partitionCDF,
          label: "Prefix-sum within each partition",
        },
        {
          highlightCol: 0,
          highlightRow: data[0][0].length - 1,
          selectOnMouseOver: false,
          label: "Each partition will emit its left col, bottom row, and bottom-left elem to other partitions left, below, and below-left of it, respectively"
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
        }
      ],
      prevSteps: []
    }
  },

  render() {
    const {
          data, partitionCDF,
          w, h,
          W, H,
          cellW, cellH,
          padX, padY,
          highlightCol, highlightRow,
          yLabelWidth, xLabelHeight,
          drawArrows, braceWidth, fontSize, label, stepIdx, steps, selectOnMouseOver
    } =
          this.state;

    return <div onKeyDown={this.onKeyPress}>
      <div className="controls" style={{ position: "relative", top: (padY / 2) + "px" }}>
        <input type="button" onClick={this.prev} value="Prev" disabled={stepIdx === -1}/>
        <input type="button" onClick={this.next} value="Next" disabled={stepIdx + 1 === steps.length}/>
        <div className="label" onClick={this.next}>{label}</div>
      </div>
      <svg className="svg" height={H * (h * cellH + padY) + xLabelHeight} width={W * (w * cellW + padX) + yLabelWidth}>
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

        {/* The vertical padding leaves room on top for arrows to be drawn.*/}
        <Translate y={padY/2 + 1}>
          <Grids {...{
            data,
            selectedData: partitionCDF,
            w, h,
            W, H,
            padX, padY,
            cellW, cellH,
            highlightCol, highlightRow,
            drawArrows, braceWidth, fontSize,
            yLabelWidth, xLabelHeight,
            selectOnMouseOver
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
    let { w, h, W, H, padX, padY, cellW, cellH, data, selectedData, drawArrows, braceWidth, fontSize, yLabelWidth, xLabelHeight, selectOnMouseOver } = this.props;
    const { selectedR, selectedC, selectedCell } = this.state;

    if (selectedCell && selectedData) {
      let { R, C, r, c } = selectedCell;
      data = JSON.parse(JSON.stringify(data));
      data[R][C][r][c] = selectedData[R][C][r][c];
    }

    let gridHeight = h * cellH, gridWidth = w * cellW;
    let paddedGridHeight = gridHeight + padY, paddedGridWidth = gridWidth + padX;
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

                  return <Translate className={className} x={C * paddedGridWidth} y={R * paddedGridHeight}>
                      <Grid
                            {...{grid, selectedGrid: selectedData[R][C], R, C, selectedCell: selectOnMouseOver && selectedCell}}
                            {...this.props}
                            onMouseDown={(e, ui) => this.onMouseDown(e, ui, R, C)}
                            selectCellFn={selectOnMouseOver ? this.cellSelected : null}
                      />
                      {arrows}
                    </Translate>
                  ;
                })
          );

    const yLabels = [];
    for (let R = 0; R < H; R++) {
      for (let r = 0; r < h; r++) {
        let label = H * h - (R * h + r);
        yLabels.push(
              <text
                    key={R + "-" + r}
                    x={cellW / 2}
                    y={paddedGridHeight * R + cellH * (r + 0.5)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={fontSize}
              >
                {label}
              </text>);
      }
    }

    const xLabels = [];
    for (let C = 0; C < W; C++) {
      for (let c = 0; c < w; c++) {
        let label = C*w + c + 1;
        xLabels.push(
              <text
                    key={C + "-" + c}
                    x={paddedGridWidth * C + cellW * (c + 0.5)}
                    y={-cellH / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={fontSize}
              >
                {label}
              </text>
        );
      }
    }

    return <g onClick={this.clearSelection}>
      <g className="y-labels">{yLabels}</g>
      <Translate x={yLabelWidth}>
        <g className="grids" onMouseLeave={this.onMouseLeave}>
          {grids}
        </g>
        <Translate y={paddedGridHeight * H - padY + xLabelHeight}>
          <g className="x-labels">{xLabels}</g>
        </Translate>
      </Translate>
    </g>;
  },

  onMouseLeave() {
    this.setState({
      selectedCell: null
    });
  },

  cellSelected(R, C, r, c) {
    this.setState({
      selectedCell: { R, C, r, c }
    });
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
    let {
          grid, selectedGrid,
          R, C,
          w, h,
          W,
          cellW, cellH,
          highlightCol, highlightRow,
          selectedCell,
          selectCellFn,
          drawArrows, braceWidth, fontSize, onMouseDown
    } =
          this.props;
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
    let selectRect = null;
    if (selectedCell) {
      const { R: sR, C: sC, r: sr, c: sc } = selectedCell;

      if (R <= sR && C >= sC) {
        selectRect = { r: h - 1, c: 0 };
        if (R === sR) {
          selectRect.r = sr;
        }

        if (C === sC) {
          selectRect.c = sc;
        }
      }
    }

    const renderFn = (r, c, ch) =>
          (selectRect &&
          r === selectRect.r &&
          c === selectRect.c) ?
                selectedGrid[r][c] :
                (ch === 0 ? '-' : null);

    const attrsFn =
          (r, c, ch) =>
                (selectedCell && selectRect &&
                r === selectRect.r &&
                c === selectRect.c) ?
                      {
                        fontWeight: "bold",
                        backgroundClass: "text-background"
                      } :
                      {};

    return <g>
      <SvgCells
            key={R + "," + C}
            rows={grid}
            w={cellW}
            h={cellH}
            fontSize={fontSize}
            cellMouseEnterFn={selectCellFn ? (r, c) => (e) => selectCellFn(R, C, r, c) : null}
            {...{highlightCol, highlightRow, onMouseDown, selectRect, renderFn, attrsFn}}
      />
      {curves}
    </g>;
  }
});

export default PrefixSum;
