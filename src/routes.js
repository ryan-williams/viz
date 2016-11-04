
import React from 'react';
import { Router, Route } from 'react-router';

import BWT from './BWT';
import Cells from './cells';
import PrefixSum from './grid';

const Routes = (props) => (
      <Router {...props}>
        <Route path="/" component={BWT} />
        <Route path="/cells" component={Cells} />
        <Route path="/grid" component={PrefixSum} />
      </Router>
);

export default Routes;
