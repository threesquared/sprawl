import LatLon from 'geodesy/latlon-spherical.js'
import { Pub } from './spoons';

/**
 * Given a LatLon find the closest pub and remove it from the given list of Pubs.
 *
 * @param start
 * @param pubs
 */
export function shiftClosestPub(start: LatLon, pubs: Pub[]): Pub {
  pubs.sort((a, b) => {
    a.distanceToNext = start.distanceTo(new LatLon(Number(a.lat), Number(a.lng)));
    b.distanceToNext = start.distanceTo(new LatLon(Number(b.lat), Number(b.lng)));

    return a.distanceToNext - b.distanceToNext;
  });

  return pubs.shift() as Pub;
}

/**
 * Convert meters to miles.
 *
 * @param distance
 */
export function metersToMiles(distance: number) {
  return distance * 0.000621371192;
}

/**
 * Convert meters to miles.
 *
 * @param distance
 */
export function milesToMeters(distance: number) {
  return distance * 1609.344;
}

/**
 * Create a pub crawl route based on finding the next nearest pub.
 *
 * @param start
 * @param allPubs
 * @param pubLimit
 * @param distanceLimit
 */
export function nearestPubNextMethod(start: LatLon, allPubs: Pub[], pubLimit: number, distanceLimit: number) {
  const pubs = [];

  const bounds = new google.maps.LatLngBounds();
  let nextPub = shiftClosestPub(start, allPubs);

  for (let i=0; i < pubLimit; i++) {
    console.log('Adding', nextPub);

    pubs.push(nextPub);
    bounds.extend(nextPub);

    nextPub = shiftClosestPub(new LatLon(nextPub.lat, nextPub.lng), allPubs);

    if(start.distanceTo(new LatLon(nextPub.lat, nextPub.lng)) > milesToMeters(distanceLimit)) {
      break;
    }
  }

  return {
    bounds,
    pubs
  }
}
