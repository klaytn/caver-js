import React from 'react';
const Caver = require('caver-js');
const testRPC = require('./testrpc');
const caver = new Caver(testRPC);

class App extends React.Component {
constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      blockNumber: -1,
    };
  }

  async getBlockNumber() {
    try {
      const bn = await caver.rpc.klay.getBlockNumber()
      if (this._isMounted) this.setState({ blockNumber: caver.utils.hexToNumber(bn) });
      return Promise.resolve()
    }catch(e) {
      return Promise.reject(e)
    }
  }
  
  componentDidMount() {
    this._isMounted = true;
    this.getBlockNumber()
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p> Klaytn BlockNumber </p>
          <p>{this.state.blockNumber}</p>
          <button onClick={() => this.getBlockNumber()}>GET LATEST BLOCK NUMBER</button>
        </header>
      </div>
    );
  }
}

export default App;
