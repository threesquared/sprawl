import React from 'react';
import { Pub } from '../lib/spoons';
import { metersToMiles, LatLng } from '../lib/distance';
import './CrawlInfo.css';

const CrawlInfo: React.FC<{ pubs: Pub[], start?: LatLng, end?: LatLng }> = ({ pubs, start, end }) => {
  if (pubs.length === 0 || !start) {
    return null;
  }

  const totalDistance = pubs.reduce((total, pub) => pub.distanceToNext ? total + pub.distanceToNext : total, 0);
  const dest = pubs[pubs.length-1];
  const waypoints = pubs.map(pub => `${pub.lat},${pub.lng}`).join('|');

  const saveObject = [
    [
      +start.lat.toFixed(4),
      +start.lng.toFixed(4)
    ],
    end ? [
      +end.lat.toFixed(4),
      +end.lng.toFixed(4)
    ] : null
  ]

  const saveData = new Buffer(JSON.stringify(saveObject)).toString('base64');

  return (
    <div className="crawlInfo">
      <small>Your crawl visits { pubs.length } pubs and is approximately { metersToMiles(totalDistance).toFixed(1) } miles long</small><br />
      <small>{ pubs.length <= 10 && (<a href={ `https://www.google.com/maps/dir/?api=1&travelmode=walking&dir_action=navigate&destination=${dest?.lat},${dest?.lng}&waypoints=${waypoints}` } target="_blank" rel="noopener noreferrer">Get directions</a>) }</small> | <small><a href={ `#${saveData}` } target="_blank" rel="noopener noreferrer">Link to this crawl</a></small>
    </div>
  );
}

export default CrawlInfo
