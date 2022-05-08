import React from 'react';
import { Marker } from 'react-map-gl';
import { LatLng } from '../lib/distance';
import start from '../img/start.png';
import finish from '../img/finish.png';

const LocationMarker: React.FC<{
  type: string;
  location: LatLng;
  setLocationFunction: Function;
}> = ({ type, location, setLocationFunction }) => {
  return (
    <Marker latitude={location.lat} longitude={location.lng} offset={[0, -15]}>
      <img
        src={type === 'start' ? start : finish}
        alt="location"
        onClick={() => setLocationFunction(undefined)}
      />
    </Marker>
  );
};

export default LocationMarker;
