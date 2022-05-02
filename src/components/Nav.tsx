import React from 'react';
import './Nav.css';

const Nav: React.FC<{ setPubLimit: Function; setDistanceLimit: Function; geoLocate: Function }> = ({
  setPubLimit,
  setDistanceLimit,
  geoLocate,
}) => {
  return (
    <div className="nav">
      <h3>Pub Crawl Generator</h3>
      <form>
        <span>
          I want to visit up to
          <input
            type="number"
            placeholder="10"
            onChange={(event) => setPubLimit(parseInt(event.target.value) || 10)}
            name="pubLimit"
          />
          pubs <br /> and end up at most
          <input
            type="number"
            placeholder="10"
            onChange={(event) => setDistanceLimit(parseInt(event.target.value) || 10)}
            name="distanceLimit"
          />{' '}
          miles away
          <br />
          <button type="button" onClick={() => geoLocate()}>
            Set start to my current location
          </button>
          <br />
          <br />
          <small>
            * Left click on the map to set a start location
            <br />* Right click to set an optional end location
          </small>
        </span>
      </form>
    </div>
  );
};

export default Nav;
