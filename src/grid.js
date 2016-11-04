
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

    return {
      data, w , h, W, H
    }
  },

  render() {
    const { data, w, h, W, H, } = this.state;
    const partitionCDF =
          data.map((gridRow, R) =>
                gridRow.map((grid, C) => {
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

    const cellW = 30;
    const cellH = 20;
    const padX = 5;
    const padY = 5;
    const extraPadX = padX + cellW;
    const extraPadY = padY + cellH*1.5;
    const arrowW = 50;

    return <svg>
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
      <Translate  y={extraPadY/2 + 1}>
        <Grids {...{ data, w, h, padX, padY, cellW, cellH }} />
        <Translate x={W * (cellW*w + padX) + arrowW}>
          <Grids {...{
            data: partitionCDF,
            w, h, W, H,
            padX: extraPadX,
            padY: extraPadY,
            cellW, cellH,
            highlightCol: 0,
            highlightRow: data.length - 1,
            drawArrows: true,
            braceWidth: 10
          }} />
        </Translate>
      </Translate>
    </svg>;
  }
});

let Grids = React.createClass({
  render() {
    let { w, h, H, padX, padY, cellW, cellH, data, drawArrows, braceWidth } = this.props;
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
                                  className="arrow"
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
                  }
                  return <Translate x={C * (gridWidth + padX)} y={R * (gridHeight + padY)}>
                    <Grid
                          {...{grid, R, C}}
                          {...this.props}
                    />
                    {arrows}
                  </Translate>
                })
          );

    return <g>{grids}</g>
  }
});

let Grid = React.createClass({
  render() {
    let { grid, R, C, w, h, W, cellW, cellH, highlightCol, highlightRow, drawArrows, braceWidth } = this.props;
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
            {...{highlightCol, highlightRow}}
      />
      {curves}
    </g>;
  }
});

export default PrefixSum;
