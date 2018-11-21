import React, { Component } from 'react';
import './App.css';

import ButtonAppBar from './Header';
import SimpleTable from './JobsTable';

class App extends Component {
  render() {
    return (
      <div className="App">
        <ButtonAppBar />
        <SimpleTable />        
      </div>
    );
  }
}

export default App;
