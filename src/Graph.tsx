import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    // configures the Perspective table view of our graph. In the next slide we’ll show you what to change.
    const schema = {
      price_abc: 'float', // prices to calculate ratio
      price_def: 'float',
      ratio: 'float', // track 2 stocks ratio
      timestamp: 'date',
      upper_bound: 'float', // bounds are to track whether bounds are crossed
      lower_bound: 'float',
      trigger_alert: 'float'
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      // elem.setAttribute('column-pivots', '["stock"]');

      // x-axis
      elem.setAttribute('row-pivots', '["timestamp"]');

      // y-axis
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg', 
        price_def: 'avg',
        ratio: 'avg', 
        timestamp: 'distinct count',
        upper_bound: 'avg', 
        lower_bound: 'avg',
        trigger_alert: 'avg'
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([ 
        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData);
    }
  }
}

export default Graph;
