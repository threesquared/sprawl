import React from 'react';
import polyline from '@mapbox/polyline';
import { metersToMiles, LatLng } from '../lib/distance';
import { Pub } from './App';
import './CrawlInfo.css';

const CrawlInfo: React.FC<{ pubs: Pub[]; start?: LatLng; end?: LatLng; distance?: number }> = ({
  pubs,
  start,
  end,
  distance,
}) => {
  if (pubs.length === 0 || !start) {
    return null;
  }

  const geoJson: [number, number][] = [[start.lat, start.lng]];

  if (end) {
    geoJson.push([end.lat, end.lng]);
  }

  const saveData = polyline.encode(geoJson);

  const dest = pubs[pubs.length - 1];
  const waypoints = pubs.map((pub) => `${pub.location.lat},${pub.location.lng}`).join('|');

  return (
    <div className="crawlInfo">
      <small>
        Your crawl visits {pubs.length} pubs and is approximately{' '}
        {metersToMiles(distance || 0).toFixed(1)} miles long
      </small>
      <br />
      <small>
        {pubs.length <= 10 && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&travelmode=walking&dir_action=navigate&destination=${dest.location.lat},${dest.location.lng}&waypoints=${waypoints}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get directions
          </a>
        )}
      </small>{' '}
      |{' '}
      <small>
        <a href={`#${saveData}`} target="_blank" rel="noopener noreferrer">
          Link to this crawl
        </a>
      </small>
    </div>
  );
};

export default CrawlInfo;
