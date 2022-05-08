import React from 'react';
import { Marker } from 'react-map-gl';
import { Pub } from './App';
import pin from '../img/beer.png';

const PubMarker: React.FC<{ pub: Pub; setSelectedPub: Function }> = ({ pub, setSelectedPub }) => {
  return (
    <Marker key={pub.id} latitude={pub.location.lat} longitude={pub.location.lng} anchor="bottom">
      <img
        src={pin}
        alt={pub.name}
        onClick={() => {
          setSelectedPub(pub);
        }}
      />
      ;
    </Marker>
  );
};

export default PubMarker;
