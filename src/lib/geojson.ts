import { Feature, LineString, lineString } from '@turf/helpers';
import { LatLng } from './distance';

/**
 * Get the whole crawl path including start and end as a GeoJSON LineString Feature
 *
 * @param coords
 * @param start
 * @param end
 */
export function getLineString(
  coords: number[][],
  start?: LatLng,
  end?: LatLng
): Feature<LineString> {
  let path: number[][] = [];

  if (start) {
    path.push([start.lng, start.lat]);
  }

  coords.forEach((coord) => path.push(coord));

  if (end) {
    path.push([end.lng, end.lat]);
  }

  return lineString(path);
}
