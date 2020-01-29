import React from 'react';
import { Pub } from '../lib/spoons';
import { metersToMiles } from '../lib/calc';
import './CrawlInfo.css';

const CrawlInfo: React.FC<{ pubs: Pub[] }> = ({ pubs }) => {
  const totalDistance = pubs.reduce((total, pub) => pub.distanceToNext ? total + pub.distanceToNext : total, 0);
  const dest = pubs.pop();
  const waypoints = pubs.map(pub => `${pub.lat},${pub.lng}`).join('|');

  return (
    <div className="crawlInfo">
      <small>Your crawl visits { pubs.length } pubs and is approximately { metersToMiles(totalDistance).toFixed(1) } miles long | <a href={ `https://www.google.com/maps/dir/?api=1&travelmode=walking&dir_action=navigate&destination=${dest?.lat},${dest?.lng}&waypoints=${waypoints}` } target="_blank" rel="noopener noreferrer">Get route</a></small>
    </div>
  );
}

export default CrawlInfo
