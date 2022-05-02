import { Coordinates } from '@mapbox/mapbox-sdk/lib/classes/mapi-request';
import directions from '@mapbox/mapbox-sdk/services/directions';

const directionsService = directions({ accessToken: process.env.REACT_APP_MAPBOX_TOKEN as string });

/**
 * Get walking directions to an array of waypoint coordinates.
 *
 * @param coords
 */
export async function getDirections(coordinates: Coordinates[]): Promise<string> {
  return new Promise((resolve, reject) => {
    directionsService.getDirections({
      profile: 'walking',
      waypoints: coordinates.map(coordinate => ({
        coordinates: coordinate,
      })),
    })
    .send()
    .then(response => {
      resolve(response.body.routes[0].geometry);
    })
    .catch(err => {
      reject(err);
    });
  });

}