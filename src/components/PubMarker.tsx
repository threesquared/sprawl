import React from 'react';
import { Marker } from 'react-map-gl';
import { Pub } from '../lib/spoons';
import pin from './pin.png';

const PubMarker: React.FC<{ pub: Pub, setSelectedPub: Function }> = ({ pub, setSelectedPub }) => {
  return (
    <Marker
      key={ pub.id }
      latitude={ pub.lat }
      longitude={ pub.lng }
      offsetLeft={ -14 }
      offsetTop={ -38 }
    >
      <img
        src={ pin }
        alt={ pub.name }
        onClick={ () => {
          setSelectedPub(pub);
        } }
      />;
    </Marker>
  );
}

export default PubMarker
