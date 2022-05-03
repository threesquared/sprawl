import { Feature, LineString, lineString } from '@turf/helpers';
import { FlyToInterpolator, ViewportProps } from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';
import { LatLng } from './distance';
import bbox from '@turf/bbox';

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

/**
 * Fit the map viewport to a GeoJSON LineString Feature bounds
 *
 * @param path
 */
export function fitViewportToBounds(
  path: Feature<LineString>,
  viewport: ViewportProps,
  padding: number = 70
): Partial<ViewportProps> {
  const [minLng, minLat, maxLng, maxLat] = bbox(path);
  const mercatorViewport = new WebMercatorViewport(viewport as any);
  const { longitude, latitude, zoom } = mercatorViewport.fitBounds(
    [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
    {
      padding,
    }
  );

  return {
    ...viewport,
    longitude,
    latitude,
    zoom,
    transitionInterpolator: new FlyToInterpolator({ speed: 1 }),
    transitionDuration: 'auto',
  };
}
