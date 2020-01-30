import React, { useState, useEffect } from 'react';
import LatLon from 'geodesy/latlon-spherical.js'
import { GoogleApiWrapper, Map, Marker, Polyline, InfoWindow } from 'google-maps-react';
import { nearestPubNextMethod, nearestTowardsEndNextMethod } from '../lib/calc';
import { getAllPubs, Pub } from '../lib/spoons';
import icon from '../lib/icon';
import Nav from './Nav';
import PubInfo from './PubInfo';
import CrawlInfo from './CrawlInfo';
import './App.css';

const App: React.FC = () => {
  const [start, setStart] = useState<LatLon>();
  const [end, setEnd] = useState<LatLon>();
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds>();
  const [activeMarker, setActiveMarker] = useState<google.maps.Marker>();
  const [selectedPub, setSelectedPub] = useState<Pub>();
  const [map, setMap] = useState<google.maps.Map>();
  const [pubLimit, setPubLimit] = useState(10);
  const [distanceLimit, setDistanceLimit] = useState(10);

  const allPubs = getAllPubs();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position: Position) => {
      setStart(new LatLon(position.coords.latitude, position.coords.longitude));
    });
  }, []);

  useEffect(() => {
    console.log('Generating crawl');

    if (!start) {
      return;
    }

    if (end) {
      let { crawlPubs, bounds } = nearestTowardsEndNextMethod(start, end, allPubs);

      setPubs(crawlPubs);
      setBounds(bounds);
    } else {
      const { crawlPubs, bounds } = nearestPubNextMethod(start, allPubs, pubLimit, distanceLimit);

      setPubs(crawlPubs);
      setBounds(bounds);
    }
  }, [start, end, pubLimit, distanceLimit]);

  return (
    <div className="app">
      <a className="github-fork-ribbon" href="https://github.com/threesquared/sprawl" data-ribbon="Fork me on GitHub" title="Fork me on GitHub">Fork me on GitHub</a>
      <Nav
        setPubLimit={ setPubLimit }
        setDistanceLimit={ setDistanceLimit }
      />
      { pubs.length && (
        <CrawlInfo
          pubs={ pubs }
        />
      ) }
      <Map
        google={ google }
        mapTypeControl={ false }
        fullscreenControl={ false }
        zoom={ 10 }
        onClick={ (props, map, event) => setStart(new LatLon(event.latLng.lat(), event.latLng.lng())) }
        onRightclick={ (props, map, event) => setEnd(new LatLon(event.latLng.lat(), event.latLng.lng())) }
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
            onDragend={ (marker: any, event: any) => setStart(new LatLon(event.position.lat(), event.position.lng())) }
          />
        ) }
        { pubs.map(pub => (
          <Marker
            key={ pub.id }
            position={ pub }
            icon={{
              url: icon,
              size: new google.maps.Size(200,200),
              scaledSize: new google.maps.Size(32,32),
              anchor: new google.maps.Point(16,32)
            }}
            onClick={ (props, marker) => {
              setSelectedPub(pub);
              setActiveMarker(marker);
            } }
          />
        )) }
        { end && (
          <Marker
            position={ end }
            draggable={ true }
            onDragend={ (marker: any, event: any) => setEnd(new LatLon(event.position.lat(), event.position.lng())) }
          />
        ) }
        <Polyline
          path={ pubs }
          strokeColor="#0000FF"
          strokeOpacity={ 0.8 }
          strokeWeight={ 2 }
        />
        <InfoWindow
          google={ google }
          map={ map as google.maps.Map }
          marker={ activeMarker as google.maps.Marker }
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
