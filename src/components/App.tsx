import React, { useState, useEffect, useRef } from 'react';
import Map, { Popup, MapRef, MapLayerMouseEvent } from 'react-map-gl';
import polyline from '@mapbox/polyline';
import bbox from '@turf/bbox';
import { Feature, LineString } from '@turf/helpers';
import { Coordinates } from '@mapbox/mapbox-sdk/lib/classes/mapi-request';
import { findPubs } from '../lib/fhrs';
import { LatLng } from '../lib/distance';
import { getLineString } from '../lib/geojson';
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
  const mapRef = useRef<MapRef>(null);
  const [start, setStart] = useState<LatLng>();
  const [end, setEnd] = useState<LatLng>();
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [path, setPath] = useState<Feature<LineString>>();
  const [distance, setDistance] = useState<number>();
  const [selectedPub, setSelectedPub] = useState<Pub>();
  const [pubLimit, setPubLimit] = useState(10);
  const [distanceLimit, setDistanceLimit] = useState(10);

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
   * Zoom the map to fit the current path
   */
  useEffect(() => {
    if (path) {
      const [minLng, minLat, maxLng, maxLat] = bbox(path);

      mapRef.current?.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 80, duration: 2000 }
      );
    }
  }, [path]);

  /**
   * Called on first load, generate initial path from saved hash or users current location
   */
  useEffect(() => {
    if (window.location.hash) {
      try {
        const linkData = polyline.decode(window.location.hash.substring(1));

        console.log(linkData);

        setStart(new LatLng(linkData[0][0], linkData[0][1]));

        if (linkData[1]) {
          setEnd(new LatLng(linkData[1][0], linkData[1][1]));
        }
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
      findPubs(start, distanceLimit).then((pubs) => {
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
          setDistance(res.distance);
        })
        .catch((err) => {
          console.error('Could not find directions', err);

          setPath(pubPath);
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
      <Map
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
        }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        initialViewState={{
          latitude: 51.5074,
          longitude: 0.1278,
          zoom: 9,
          // bearing: 0,
          // pitch: 50
        }}
        onClick={(event: MapLayerMouseEvent) => {
          if ((event!.originalEvent!.target! as any).nodeName !== 'IMG') {
            setStart(new LatLng(event.lngLat.lat, event.lngLat.lng));
          }
        }}
        onContextMenu={(event: MapLayerMouseEvent) => {
          setEnd(new LatLng(event.lngLat.lat, event.lngLat.lng));
          event.preventDefault();
        }}
      >
        {start && <LocationMarker type="start" location={start} setLocationFunction={setStart} />}
        {getPubMarkers()}
        {end && <LocationMarker type="end" location={end} setLocationFunction={setEnd} />}
        {path && <PathLine path={path} />}
        {getPubInfo()}
      </Map>
    </div>
  );
};

export default App;
