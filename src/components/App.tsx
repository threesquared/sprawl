import React, { useState, useEffect } from 'react';
import { GoogleApiWrapper, Map, Marker, InfoWindow, Polyline } from 'google-maps-react';
import { getAllPubs, Pub } from '../lib/spoons';
import { LatLng } from '../lib/distance';
import CrawlCalculator from '../lib/CrawlCalculator';
import Nav from './Nav';
import PubInfo from './PubInfo';
import CrawlInfo from './CrawlInfo';
import pin from './pin.png';
import './App.css';

const App: React.FC = () => {
  const [start, setStart] = useState<LatLng>();
  const [end, setEnd] = useState<LatLng>();
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds>();
  const [activeMarker, setActiveMarker] = useState<google.maps.Marker>();
  const [selectedPub, setSelectedPub] = useState<Pub>();
  const [map, setMap] = useState<google.maps.Map>();
  const [pubLimit, setPubLimit] = useState(10);
  const [distanceLimit, setDistanceLimit] = useState(10);
  const [showAll, setShowAll] = useState(false);

  const allPubs = getAllPubs();

  const geoLocate = () => {
    navigator.geolocation.getCurrentPosition((position: Position) => {
      setStart(new LatLng(position.coords.latitude, position.coords.longitude));
    });
  }

  const getPubMarkers = () => {
    let markers = pubs.map(pub => (
      <Marker
        key={ pub.id }
        position={ pub }
        icon={{
          url: pin,
          scaledSize: new google.maps.Size(27,39)
        }}
        onClick={ (props, marker) => {
          setSelectedPub(pub);
          setActiveMarker(marker);
        } }
      />
    ));

    if (showAll) {
      markers= markers.concat(allPubs.filter(pub => !pubs.includes(pub)).map(pub => (
        <Marker
          key={ pub.id }
          position={ pub }
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          }}
          onClick={ (props, marker) => {
            setSelectedPub(pub);
            setActiveMarker(marker);
          } }
        />
      )));
    }

    return markers;
  }

  const getCrawlPath = () => {
    const path: (google.maps.LatLngLiteral)[] = [];

    if (start) {
      path.push(start);
    }

    path.push(...pubs);

    if (end) {
      path.push(end);
    }

    return path;
  }

  useEffect(() => {
    if (window.location.hash) {
      try {
        const [savedStart, savedEnd] = JSON.parse(new Buffer(window.location.hash.substring(1), 'base64').toString('ascii'));

        if (savedEnd){
          setEnd(new LatLng(savedEnd.lat, savedEnd.lng));
        }

        setStart(new LatLng(savedStart.lat, savedStart.lng));

      } catch(e) {
        alert('Sorry, could not parse that saved url')
      }
    } else {
      geoLocate();
    }
  }, []);

  useEffect(() => {
    if (start) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(start);

      const calculator = new CrawlCalculator(allPubs, start);

      if (end) {
        bounds.extend(end);
        calculator.setEnd(end);
      }

      const crawlPubs = calculator.getCrawlPubs(pubLimit, distanceLimit);
      crawlPubs.forEach(pub => bounds.extend(pub));

      setBounds(bounds);
      setPubs(crawlPubs);
    } else {
      setPubs([]);
    }
  }, [start, end, pubLimit, distanceLimit]);

  return (
    <div className="app">
      <a className="github-fork-ribbon" href="https://github.com/threesquared/sprawl" data-ribbon="Fork me on GitHub" title="Fork me on GitHub">Fork me on GitHub</a>
      <Nav
        setPubLimit={ setPubLimit }
        setDistanceLimit={ setDistanceLimit }
        geoLocate={ geoLocate }
        showAll={ showAll }
        setShowAll={ setShowAll }
      />
      <CrawlInfo
        pubs={ pubs }
        start={ start }
        end={ end }
      />
      <Map
        google={ google }
        mapTypeControl={ false }
        fullscreenControl={ false }
        zoom={ 10 }
        onClick={ (props, map, event) => setStart(new LatLng(event.latLng.lat(), event.latLng.lng())) }
        onRightclick={ (props, map, event) => setEnd(new LatLng(event.latLng.lat(), event.latLng.lng())) }
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
            onDragend={ (marker: any, event: any) => setStart(new LatLng(event.position.lat(), event.position.lng())) }
            onClick={ () => setStart(undefined) }
          />
        ) }
        { getPubMarkers() }
        { end && (
          <Marker
            position={ end }
            draggable={ true }
            onDragend={ (marker: any, event: any) => setEnd(new LatLng(event.position.lat(), event.position.lng())) }
            onClick={ () => setEnd(undefined) }
          />
        ) }
        <Polyline
          path={ getCrawlPath() }
          strokeColor="#0000FF"
          strokeOpacity={ 0.8 }
          strokeWeight={ 2 }
        />
        <InfoWindow
          google={ google }
          map={ map as google.maps.Map }
          marker={ activeMarker as google.maps.Marker }
          visible={ activeMarker !== null }
        >
          <PubInfo
            pub={ selectedPub }
            start={ start }
          />
        </InfoWindow>
      </Map>
    </div>
  );
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY as string,
  libraries: [
    'geometry',
    'places'
  ]
})(App)
