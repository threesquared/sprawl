import React from 'react';
import LatLon from 'geodesy/latlon-spherical.js'
import { Pub } from '../lib/spoons';

const PubInfo: React.FC<{ pub: Pub, start?: LatLon }> = ({ pub, start }) => {
  return (
    <div>
      <h3>{ pub.name }</h3>
      <small>
        { pub.address1 }<br/>
        { pub.city } { pub.postcode }
      </small>
      <p>
        <a href={ `https://www.google.com/maps/dir/?api=1&origin=${start?.lat},${start?.lng}&destination=${pub.lat},${pub.lng}` } target="_blank" rel="noopener noreferrer">Directions</a> | <a href={ `https://www.jdwetherspoon.com${pub.url}` } target="_blank" rel="noopener noreferrer">Website</a>
      </p>
    </div>
  );
}

export default PubInfo
