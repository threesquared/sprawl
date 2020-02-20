import { Feature, LineString, lineString } from '@turf/helpers';
import { FlyToInterpolator, ViewportProps } from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';
import { LatLng } from './distance';
import { Pub } from './spoons';
import bbox from '@turf/bbox';

/**
 * Get the whole crawl path including start and end as a GeoJSON LineString Feature
 *
 * @param pubs
 * @param start
 * @param end
 */
export function getLineString(pubs: Pub[], start?: LatLng, end?: LatLng): Feature<LineString> {
 let path: number[][] = [];

 if (start) {
   path.push([start.lng, start.lat]);
 }

 pubs.forEach(pub => path.push([pub.lng, pub.lat]));

 if (end) {
   path.push([end.lng, end.lat]);
 }

 return lineString(path);
}

/**
 * Fit the map viewport to a GeoJSON LineString Feature bounds
 *
 * @param path
 */
export function fitViewportToBounds(path: Feature<LineString>, viewport: Partial<ViewportProps>, padding: number = 70): Partial<ViewportProps> {
  const [minLng, minLat, maxLng, maxLat] = bbox(path);
  const mercatorViewport = new WebMercatorViewport(viewport);
  const { longitude, latitude, zoom } = mercatorViewport.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
    padding
  });

  return {
    ...viewport,
    longitude,
    latitude,
    zoom,
    transitionInterpolator: new FlyToInterpolator({ speed: 1 }),
    transitionDuration: 'auto'
  };
}
