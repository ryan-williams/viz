# viz
Simple interactive algorithm visualizations

## Burrows-Wheeler Transform

![](https://camo.githubusercontent.com/6e1e970fcbf1a6202f6b5a604e90e3303a71e0c0/68747470733a2f2f64337676366c703535716a6171632e636c6f756466726f6e742e6e65742f6974656d732f31553161314e3246336a33343266317a306330702f53637265656e2532305265636f7264696e67253230323031362d31302d3331253230617425323030312e3238253230504d2e6769663f582d436c6f75644170702d56697369746f722d49643d343836373430)

The matrices+sort widget hides itself for strings >50 chars long; it starts to really lag at 10s of chars. Each letter is a separate `<text>` element in an `<svg>`; maybe with a `<canvas>` I could do better? ¯\_(ツ)_/¯

The bottom two rows are the BWT, and a naively run-length-encoded (RLE) BWT. For all the examples here, the latter uses more characters than the former; in production use there would be some other transfrom applied to the RLE'd BWT, that would really reduce the space occupied, perhaps? And/or: larger data sizes, beyond what can be viz'd here, would exhibit better savings from RLE.

## Distributed 2-D Prefix-Sum

[Live Demo](https://bwt.runsascoded.com/grid)

![](https://d3vv6lp55qjaqc.cloudfront.net/items/1c302C09271q2r2P1t1M/Screen%20Recording%202017-02-08%20at%2001.26%20AM.gif?X-CloudApp-Visitor-Id=486740)

## Installation

To run locally:

```
git clone git@github.com:ryan-williams/bwt.git && cd bwt
npm start
```
