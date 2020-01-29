import React from 'react';
import './Nav.css';

const Nav: React.FC<{ setPubLimit: Function, setDistanceLimit: Function }> = ({ setPubLimit, setDistanceLimit }) => {
  return (
    <div className="nav">
      <h3>Spoons Pub Crawl Generator</h3>
      <form>
        I want to visit up to
        <input type="number" placeholder="10" onChange={ event => setPubLimit(parseInt(event.target.value) || 10) } name="pubLimit" />
        pubs <br /> and only end up
        <input type="number" placeholder="10" onChange={ event => setDistanceLimit(parseInt(event.target.value) || 10) } name="distanceLimit" /> miles away
        <br />
        <br />
        <small>* Left click to set a start location<br />* Right click to set an end location</small>
      </form>
    </div>
  );
}

export default Nav
