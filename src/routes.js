
import React from 'react';
import { Router, Route } from 'react-router';

import BWT from './BWT';
import Cells from './cells';

const Routes = (props) => (
      <Router {...props}>
        <Route path="/" component={BWT} />
        <Route path="/cells" component={Cells} />
      </Router>
);

export default Routes;
