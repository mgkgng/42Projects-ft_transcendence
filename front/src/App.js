import logo from './logo.svg';
import './App.css';
import React from 'react';


function Bite()
{
  return (<h1>8================D</h1>);
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <Bite/>
    </div>
  );
}


export default App;