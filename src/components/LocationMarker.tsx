import React from 'react';
import { Marker } from 'react-map-gl';
import { LatLng } from '../lib/distance';

const LocationMarker: React.FC<{ location: LatLng, setLocationFunction: Function }> = ({ location, setLocationFunction }) => {
  return (
    <Marker
      latitude={ location.lat }
      longitude={ location.lng }
      offsetLeft={ -15 }
      offsetTop={ -31 }
    >
      <img
        src="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        alt="location"
        onClick={ () => setLocationFunction(undefined) }
      />
    </Marker>
  );
}

export default LocationMarker
