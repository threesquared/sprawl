import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import apiData from '../spoons.json';
import './App.css';
import { Pub } from '../lib/spoons.js';
import LatLon from 'geodesy/latlon-spherical.js'
import { findClosest } from '../lib/calc';
import { GoogleApiWrapper, Map, Marker, Polyline } from 'google-maps-react';

const App: React.FC = () => {
  const [locations, setLocations] = useState<Pub[]>([]);
  const [bounds, setBounds] = useState<any>();

  useEffect(() => {
    const allPubs: Pub[] = _.flatten(_.flatten(_.map(apiData.regions, 'subRegions')).map(region => region.items)); // Fix this dumb shit

    navigator.geolocation.getCurrentPosition((position: Position) => {
      const bounds = new google.maps.LatLngBounds();
      var latlon = new LatLon(position.coords.latitude, position.coords.longitude);
      const crawlPubs = [];

      for (let i=0; i <= 10; i++) {
        const next = findClosest(latlon, allPubs);

        console.log('Adding', next);

        crawlPubs.push(next);
        bounds.extend(next);

        latlon = new LatLon(next.lat, next.lng)
      }

      setLocations(crawlPubs);
      setBounds(bounds);
    });
  }, []);

  return (
    <div className="App">
      <div className="nav">Nav Menu</div>
      <Map
        google={ google }
        mapTypeControl={ false }
        zoom={10}
        bounds={ bounds }
        initialCenter={{
          lat: 51.5074,
          lng: 0.1278
        }}
      >
        { locations.map(location => (
          <Marker
            key={location.id}
            name={location.name}
            position={location}
          />
        )) }
        <Polyline
          path={locations}
          strokeColor="#0000FF"
          strokeOpacity={0.8}
          strokeWeight={2} />
      </Map>
    </div>
  );
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyBETDtuc4hnJsvED2xeT6Lw99uJO_asPZI'
})(App)
