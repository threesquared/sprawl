import { Coordinates } from '@mapbox/mapbox-sdk/lib/classes/mapi-request';
import directions from '@mapbox/mapbox-sdk/services/directions';
import { Position } from '@turf/helpers';

const directionsService = directions({ accessToken: process.env.REACT_APP_MAPBOX_TOKEN as string });

/**
 * Get walking directions to an array of waypoint coordinates.
 *
 * @param coords
 */
export async function getDirections(
  coordinates: Position[]
): Promise<{ geometry: string; distance: number }> {
  return new Promise((resolve, reject) => {
    directionsService
      .getDirections({
        profile: 'walking',
        waypoints: coordinates.map((coordinate) => ({
          coordinates: coordinate as Coordinates,
        })),
      })
      .send()
      .then((response) => {
        resolve({
          geometry: response.body.routes[0].geometry,
          distance: response.body.routes[0].distance,
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}
