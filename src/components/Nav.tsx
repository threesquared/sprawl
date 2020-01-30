import React from 'react';
import './Nav.css';

const Nav: React.FC<{ mode: string, setMode: Function, setPubLimit: Function, setDistanceLimit: Function, geoLocate: Function, showAll: boolean; setShowAll: Function }> = ({ mode, setMode, setPubLimit, setDistanceLimit, geoLocate, showAll, setShowAll }) => {

  const getModeOptions = () => {
    if (mode === 'surprise') {
      return (
        <span>
          I want to visit up to
          <input type="number" placeholder="10" onChange={ event => setPubLimit(parseInt(event.target.value) || 10) } name="pubLimit" />
          pubs <br /> and only end up
          <input type="number" placeholder="10" onChange={ event => setDistanceLimit(parseInt(event.target.value) || 10) } name="distanceLimit" /> miles away
          <br />
          <button type="button" onClick={ () => geoLocate() }>Set start to my current location</button>
          <br />
          <br />
          <small>* Click on the map to set a start location<br />* Drag the red marker to change the location</small>
        </span>
      );
    }

    if (mode === 'line') {
      return (
        <span>
          <small>* Left click to set a start location<br />* Right click to set an end location<br />* Drag red markers to change locations</small>
        </span>
      );
    }
  }

  return (
    <div className="nav">
      <h3>Spoons Pub Crawl Generator</h3>
      <form>
        Mode<br />
        <select onChange={ event => setMode(event.target.value) }>
          <option value="surprise">Surprise me</option>
          <option value="line">Select start and end</option>
        </select>
        <br />
        <br />
        { getModeOptions() }
        <br />
        <br />
        <label>
          <input type="checkbox" onChange={ () => setShowAll(!showAll) } /><small>Show all other locations</small>
        </label>
      </form>
    </div>
  );
}

export default Nav
