import LatLon from 'geodesy/latlon-spherical.js'
import { Pub } from './spoons';

export function findClosest(start: LatLon, locations: Pub[]): Pub {
  locations.sort((a, b) => {
    a.distanceTo = start.distanceTo(new LatLon(Number(a.lat), Number(a.lng)));
    b.distanceTo = start.distanceTo(new LatLon(Number(b.lat), Number(b.lng)));

    return a.distanceTo - b.distanceTo;
  });

  return locations.shift() as Pub;
}
