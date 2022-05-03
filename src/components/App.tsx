import React, { useState, useEffect } from 'react';
import MapGL, { Popup, ViewportProps } from 'react-map-gl';
import polyline from '@mapbox/polyline';
import { Feature, LineString } from '@turf/helpers';
import { Coordinates } from '@mapbox/mapbox-sdk/lib/classes/mapi-request';
import { findPubs } from '../lib/google';
import { LatLng } from '../lib/distance';
import { getLineString, fitViewportToBounds } from '../lib/geojson';
import { getDirections } from '../lib/directions';
import CrawlCalculator from '../calculators/CrawlCalculator';
import Nav from './Nav';
import PubInfo from './PubInfo';
import CrawlInfo from './CrawlInfo';
import PubMarker from './PubMarker';
import LocationMarker from './LocationMarker';
import PathLine from './PathLine';
import './App.css';

export interface Pub {
  id: string;
  name: string;
  address: string;
  location: LatLng;
}

const App: React.FC = () => {
  const [start, setStart] = useState<LatLng>();
  const [end, setEnd] = useState<LatLng>();
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [path, setPath] = useState<Feature<LineString>>();
  const [distance, setDistance] = useState<number>();
  const [selectedPub, setSelectedPub] = useState<Pub>();
  const [pubLimit, setPubLimit] = useState(10);
  const [distanceLimit, setDistanceLimit] = useState(10);
  const [viewport, setViewport] = useState<Partial<ViewportProps>>({
    latitude: 51.5074,
    longitude: 0.1278,
    zoom: 9,
    // bearing: 0,
    // pitch: 50
  });

  /**
   * Ask user for their location and set the crawl start to that position
   */
  const geoLocate = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setStart(new LatLng(position.coords.latitude, position.coords.longitude));
    });
  };

  /**
   * Get markers for all visible pubs
   */
  const getPubMarkers = () => {
    let markers = pubs.map((pub, index) => (
      <PubMarker key={index} pub={pub} setSelectedPub={setSelectedPub} />
    ));

    return markers;
  };

  /**
   * Get an info window for the selected pub
   */
  const getPubInfo = () => {
    return (
      selectedPub && (
        <Popup
          tipSize={5}
          anchor="top"
          longitude={selectedPub.location.lng}
          latitude={selectedPub.location.lat}
          closeOnClick={false}
          onClose={() => setSelectedPub(undefined)}
        >
          <PubInfo pub={selectedPub} start={start} />
        </Popup>
      )
    );
  };

  /**
   * Called on first load, generate initial path from saved hash or users current location
   */
  useEffect(() => {
    if (window.location.hash) {
      try {
        const [savedStart, savedEnd] = JSON.parse(
          new Buffer(window.location.hash.substring(1), 'base64').toString('ascii')
        );

        if (savedEnd) {
          setEnd(new LatLng(savedEnd[0], savedEnd[1]));
        }

        setStart(new LatLng(savedStart[0], savedStart[1]));
      } catch (e) {
        alert('Sorry, could not parse that saved url');
      }
    } else {
      geoLocate();
    }
  }, []);

  /**
   * Called when any crawl parameters are updated, regenerate the path
   */
  useEffect(() => {
    if (start) {
      findPubs(start).then((pubs) => {
        const calculator = new CrawlCalculator(pubs as Pub[], start);

        if (end) {
          calculator.setEnd(end);
        }

        let limit = pubLimit;

        if (pubLimit > pubs.length) {
          limit = pubs.length;
        }

        const crawlPubs = calculator.getCrawlPubs(limit, distanceLimit);
        setPubs(crawlPubs);
      });
    } else {
      setPubs([]);
    }
  }, [start, end, pubLimit, distanceLimit]);

  /**
   * Generate a crawl path and resize the viewport
   */
  useEffect(() => {
    if (start && pubs.length > 0) {
      const pubCoords = pubs.map((pub) => [pub.location.lng, pub.location.lat] as Coordinates);
      const pubPath = getLineString(pubCoords, start, end);

      getDirections(pubPath.geometry.coordinates)
        .then((res) => {
          const path = getLineString(polyline.toGeoJSON(res.geometry).coordinates, start, end);
          setPath(path);
          setViewport(fitViewportToBounds(path, viewport));
          setDistance(res.distance);
        })
        .catch((err) => {
          console.error('Could not find directions', err);

          setPath(pubPath);
          setViewport(fitViewportToBounds(pubPath, viewport));
        });
    } else {
      setPath(undefined);
    }
  }, [pubs, start, end]);

  return (
    <div className="app">
      <a
        className="github-fork-ribbon"
        href="https://github.com/threesquared/sprawl"
        data-ribbon="Fork me on GitHub"
        title="Fork me on GitHub"
      >
        Fork me on GitHub
      </a>
      <Nav setPubLimit={setPubLimit} setDistanceLimit={setDistanceLimit} geoLocate={geoLocate} />
      <CrawlInfo pubs={pubs} start={start} end={end} distance={distance} />
      <MapGL
        {...viewport}
        width="100%"
        height="100%"
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        onViewportChange={setViewport}
        onClick={(event: any) => {
          if (event.leftButton === true && event.target.nodeName !== 'IMG') {
            setStart(new LatLng(event.lngLat[1], event.lngLat[0]));
          }
        }}
        onContextMenu={(event: any) => {
          setEnd(new LatLng(event.lngLat[1], event.lngLat[0]));
          event.preventDefault();
        }}
      >
        {start && <LocationMarker type="start" location={start} setLocationFunction={setStart} />}
        {getPubMarkers()}
        {end && <LocationMarker type="end" location={end} setLocationFunction={setEnd} />}
        {path && <PathLine path={path} />}
        {getPubInfo()}
      </MapGL>
    </div>
  );
};

export default App;
