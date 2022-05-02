import React from 'react';
import { LatLng } from '../lib/distance';
import { Pub } from './App';

const PubInfo: React.FC<{ pub?: Pub, start?: LatLng }> = ({ pub, start }) => {
  if (!pub) {
    return null;
  }

  return (
    <div>
      <h3>{ pub.name }</h3>
      <small>
        { pub.address }<br/>
      </small>
      <p>
        <a href={ `https://www.google.com/maps/dir/?api=1&origin=${start?.lat},${start?.lng}&destination=${pub.location.lat},${pub.location.lng}` } target="_blank" rel="noopener noreferrer">Directions</a>
      </p>
    </div>
  );
}

export default PubInfo
