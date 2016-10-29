
import _ from 'underscore';
import React, { Component } from 'react';

class Input extends Component {
  render() {
    return <textarea className="input" cols="50" rows="4" {...this.props} />;
  }
}

class Examples extends Component {
  render() {
    return <div className="examples">
      <h4>Examples:</h4>
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

export { Input, Examples };
