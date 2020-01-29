import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import apiData from '../spoons.json';
import './App.css';
import { Pub } from '../lib/spoons.js';
import LatLon from 'geodesy/latlon-spherical.js'
import { findClosestPub } from '../lib/calc';
import { GoogleApiWrapper, Map, Marker, Polyline, InfoWindow } from 'google-maps-react';
import Nav from './Nav';
import PubInfo from './PubInfo';

const App: React.FC = () => {
  const [start, setStart] = useState<LatLon>();
  const [locations, setLocations] = useState<Pub[]>([]);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds>();
  const [activeMarker, setActiveMarker] = useState<any>();
  const [selectedPub, setSelectedPub] = useState<Pub>();
  const [map, setMap] = useState<google.maps.Map>();
  const [pubLimit, setPubLimit] = useState(10);
  const [distanceLimit, setDistanceLimit] = useState(20);

  const icon = '<svg version="1.1" viewBox="0 0 27 39" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g transform="translate(1 1)"><circle id="a" cx="12.5" cy="12.5" r="11.111" fill="#fff"/><path d="m12.501 0c-6.9038 0-12.501 5.5979-12.501 12.5 0 2.2793 0.61375 4.4099 1.6794 6.2504l10.821 18.749 10.821-18.749c1.0656-1.8406 1.6788-3.9711 1.6788-6.2504 0-6.9023-5.5969-12.5-12.499-12.5zm0.14933 22.486c5.4248 0 9.8364-4.4137 9.8364-9.8381 0-5.4244-4.4115-9.8367-9.8364-9.8367-5.4248 0-9.8392 4.4123-9.8392 9.8367 0 5.4244 4.4143 9.8381 9.8392 9.8381z" fill="#197DFF" stroke="#197DFF"/><circle cx="12.5" cy="12.5" r="11.111" stroke="#fff"/><path d="m8.9174 14.934 1.7554-7.9459 0.14647-0.11764h3.4018l0.14516 0.1122 1.8613 7.1476 1.9074-7.2237 0.14503-0.1117h2.1861l0.12646 0.069327 1.0616 1.6641 0.016716 0.1254-2.9514 9.447-0.14343 0.10527-3.9443-0.0068161-0.14602-0.11679-1.8223-8.0267-2.1141 8.0228-0.14505 0.11178h-3.9235l-0.14376-0.1072-2.7585-9.2647 0.015656-0.12083 1.069-1.7551 0.12811-0.071971h1.995l0.14553 0.11365 1.9856 7.9499z" fill="#197DFF" stroke="#197DFF" stroke-width=".3"/></g></g></svg>';

  const allPubs: Pub[] = _.flatten(_.flatten(_.map(apiData.regions, 'subRegions')).map(region => region.items)); // Fix this dumb shit

  const markerMoved = (marker: any, event: any) => {
    var latlon = new LatLon(event.position.lat(), event.position.lng());

    plotCrawl(latlon);
  };

  const plotCrawl = (start: LatLon) => {
    console.log('Generating crawl');

    const bounds = new google.maps.LatLngBounds();

    setStart(start);

    const crawlPubs = [];

    let nextPub = findClosestPub(start, allPubs);

    for (let i=0; i < pubLimit; i++) {
      console.log('Adding', nextPub);

      crawlPubs.push(nextPub);
      bounds.extend(nextPub);

      nextPub = findClosestPub(new LatLon(nextPub.lat, nextPub.lng), allPubs);

      if(start.distanceTo(new LatLon(nextPub.lat, nextPub.lng)) > (distanceLimit * 1609.344)) {
        break;
      }
    }

    setLocations(crawlPubs);
    setBounds(bounds);
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position: Position) => {
      var latlon = new LatLon(position.coords.latitude, position.coords.longitude);

      plotCrawl(latlon);
    });
  }, []);

  return (
    <div className="App">
      <Nav
        setPubLimit={ setPubLimit }
        setDistanceLimit={ setDistanceLimit }
        onSubmit={ () => start ? plotCrawl(start) : false }
      />
      <Map
        google={ google }
        mapTypeControl={ false }
        zoom={10}
        onClick={ (props) => setActiveMarker(null) }
        onReady={ (props, map) => setMap(map) }
        bounds={ bounds }
        initialCenter={{
          lat: 51.5074,
          lng: 0.1278
        }}
      >
        { start && (
          <Marker
            position={ start }
            draggable={ true }
            onDragend={ markerMoved }
            onClick={ (props, marker) => {
              setSelectedPub(props as any);
              setActiveMarker(marker);
            } }
          />
        ) }
        { locations.map(location => (
          <Marker
            key={ location.id }
            position={ location }
            icon={{
              url:`data:image/svg+xml;charset=utf-8,${encodeURIComponent(icon)}`,
              size: new google.maps.Size(200,200),
              scaledSize: new google.maps.Size(32,32),
              anchor: new google.maps.Point(16,32),
              labelOrigin: new google.maps.Point(0,0)
            }}
            onClick={ (props, marker) => {
              setSelectedPub(location);
              setActiveMarker(marker);
            } }
          />
        )) }
        <Polyline
          path={ locations }
          strokeColor="#0000FF"
          strokeOpacity={ 0.8 }
          strokeWeight={ 2 }
        />
        <InfoWindow
          google={ google }
          map={ map as google.maps.Map }
          marker={ activeMarker }
          pixelOffset={ new google.maps.Size(-85, 0) }
          visible={ activeMarker !== null }
        >
          { selectedPub && (
            <PubInfo
              pub={ selectedPub }
              start={ start }
            />
          ) }
        </InfoWindow>
      </Map>
    </div>
  );
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY as string
})(App)
