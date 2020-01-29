import React from 'react';

const Nav: React.FC<{ setPubLimit: Function, setDistanceLimit: Function, onSubmit: any }> = ({ setPubLimit, setDistanceLimit, onSubmit }) => {
  return (
    <div className="nav">
      <h3>Spoons Pub Crawl Generator</h3>
      <form>
        I want to visit up to
        <input type="number" placeholder="10" onChange={ event => setPubLimit(parseInt(event.target.value) || 10) } name="pubLimit" />
        pubs <br /> and only end up
        <input type="number" placeholder="20" onChange={ event => setDistanceLimit(parseInt(event.target.value) || 20) } name="distanceLimit" /> miles away
        <br />
        <button type="button" onClick={ onSubmit }>Recalculate</button>
        <br />
        <br />
        <small>* You can drag the red start location icon</small>
      </form>
    </div>
  );
}

export default Nav
