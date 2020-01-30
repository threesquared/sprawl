import _ from 'lodash';
import LatLon from 'geodesy/latlon-spherical.js'
import { Pub } from './spoons';

/**
 * Given a LatLon sort Pubs by distance to it.
 *
 * @param start
 * @param pubs
 */
export function sortPubsByDistanceTo(start: LatLon, pubs: Pub[]): void {
  pubs.sort((a, b) => {
    a.distanceToNext = start.distanceTo(new LatLon(Number(a.lat), Number(a.lng)));
    b.distanceToNext = start.distanceTo(new LatLon(Number(b.lat), Number(b.lng)));

    return a.distanceToNext - b.distanceToNext;
  });
}

/**
 * Given a LatLon find the closest pub and remove it from the given list of Pubs.
 *
 * @param start
 * @param pubs
 */
export function shiftClosestPub(start: LatLon, pubs: Pub[]): Pub {
  sortPubsByDistanceTo(start, pubs);

  return pubs.shift() as Pub;
}

/**
 * Given a LatLon find the closest pub from the given list of Pubs.
 *
 * @param start
 * @param pubs
 */
export function getClosestPub(start: LatLon, pubs: Pub[]): Pub {
  sortPubsByDistanceTo(start, pubs);

  return pubs[0];
}

/**
 * Given a LatLon find the closest pub and remove it from the given list of Pubs.
 *
 * @param start
 * @param pubs
 */
export function getClosestPubs(start: LatLon, pubs: Pub[], limit: number = 10): Pub[] {
  sortPubsByDistanceTo(start, pubs);

  return pubs.slice(0, limit);
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
  const crawlPubs = [];
  const availablePubs = allPubs;

  const bounds = new google.maps.LatLngBounds();
  bounds.extend({ lat: start.lat, lng: start.lng });

  let nextPub = shiftClosestPub(start, availablePubs);

  for (let i=0; i < pubLimit; i++) {
    console.log('Adding', nextPub);

    crawlPubs.push(nextPub);

    bounds.extend(nextPub);

    nextPub = shiftClosestPub(new LatLon(nextPub.lat, nextPub.lng), availablePubs);

    if(start.distanceTo(new LatLon(nextPub.lat, nextPub.lng)) > milesToMeters(distanceLimit)) {
      break;
    }
  }

  return {
    bounds,
    crawlPubs
  }
}

/**
 * Create a pub crawl route based on finding the next nearest pub that is also closest to the end point.
 *
 * @param start
 * @param allPubs
 * @param pubLimit
 * @param distanceLimit
 */
export function nearestTowardsEndNextMethod(start: LatLon, end: LatLon, allPubs: Pub[]) {
  const crawlPubs = [];
  const availablePubs = allPubs;

  const bounds = new google.maps.LatLngBounds();

  const startPub = shiftClosestPub(start, availablePubs);
  crawlPubs.push(startPub);
  bounds.extend(startPub);

  console.log('Start', startPub);

  const endPub = getClosestPub(end, availablePubs);

  console.log('End', endPub);

  let testPubs = getClosestPubs(start, availablePubs);
  let nextPub = shiftClosestPub(end, testPubs);
  _.remove(availablePubs, pub => pub.id === nextPub.id);
  console.log('Next', nextPub);

  while (nextPub.id !== endPub.id) {
    crawlPubs.push(nextPub);
    bounds.extend(nextPub);

    testPubs = getClosestPubs(new LatLon(nextPub.lat, nextPub.lng), availablePubs);
    nextPub = shiftClosestPub(end, testPubs);
    console.log('Next', nextPub);
    _.remove(availablePubs, pub => pub.id === nextPub.id);
  }

  crawlPubs.push(endPub);
  bounds.extend(endPub);

  return {
    bounds,
    crawlPubs
  }
}
