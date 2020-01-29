import React, { useState, useEffect } from 'react';
import LatLon from 'geodesy/latlon-spherical.js'
import { GoogleApiWrapper, Map, Marker, Polyline, InfoWindow } from 'google-maps-react';
import { nearestPubNextMethod } from '../lib/calc';
import { getAllPubs, Pub } from '../lib/spoons';
import icon from '../lib/icon';
import Nav from './Nav';
import PubInfo from './PubInfo';
import './App.css';
import CrawlInfo from './CrawlInfo';

const App: React.FC = () => {
  const [start, setStart] = useState<LatLon>();
  const [locations, setLocations] = useState<Pub[]>([]);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds>();
  const [activeMarker, setActiveMarker] = useState<google.maps.Marker>();
  const [selectedPub, setSelectedPub] = useState<Pub>();
  const [map, setMap] = useState<google.maps.Map>();
  const [pubLimit, setPubLimit] = useState(10);
  const [distanceLimit, setDistanceLimit] = useState(20);

  const allPubs = getAllPubs();

  const markerMoved = (marker: any, event: any) => {
    var latlon = new LatLon(event.position.lat(), event.position.lng());

    plotCrawl(latlon);
  };

  const plotCrawl = (start: LatLon) => {
    console.log('Generating crawl');

    setStart(start);

    const { pubs, bounds } = nearestPubNextMethod(start, allPubs, pubLimit, distanceLimit);

    setLocations(pubs);
    setBounds(bounds);
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position: Position) => {
      var latlon = new LatLon(position.coords.latitude, position.coords.longitude);

      plotCrawl(latlon);
    });
  }, []);

  return (
    <div className="app">
      <Nav
        setPubLimit={ setPubLimit }
        setDistanceLimit={ setDistanceLimit }
        onSubmit={ () => start ? plotCrawl(start) : false }
      />
      { locations.length && (
        <CrawlInfo
          pubs={ locations }
        />
      ) }
      <Map
        google={ google }
        mapTypeControl={ false }
        zoom={ 10 }
        onClick={ () => setActiveMarker(undefined) }
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
          />
        ) }
        { locations.map(location => (
          <Marker
            key={ location.id }
            position={ location }
            icon={{
              url: icon,
              size: new google.maps.Size(200,200),
              scaledSize: new google.maps.Size(32,32),
              anchor: new google.maps.Point(16,32)
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
