import axios from 'axios';
import { Pub } from '../components/App';
import { LatLng } from './distance';

const instance = axios.create({
  baseURL: 'http://api.ratings.food.gov.uk/',
  headers: { 'x-api-version': '2' },
});

/**
 * Find pubs and bars in a given area from the Food Hygiene API
 *
 * @param service
 * @param location
 */
export function findPubs(location: LatLng, distance: number): Promise<Pub[]> {
  return instance
    .get('/Establishments', {
      params: {
        longitude: location.lng,
        latitude: location.lat,
        distance,
        pageSize: 5000,
        businessTypeId: 7843,
        sortOptionKey: 'Distance',
      },
    })
    .then((response) => {
      return response.data.establishments.map((result: any) => {
        return {
          id: result.FHRSID as string,
          name: result.BusinessName as string,
          address: result.AddressLine1 as string,
          location: new LatLng(
            parseFloat(result.geocode.latitude),
            parseFloat(result.geocode.longitude)
          ),
        };
      });
    })
    .catch((error) => {
      return error;
    });
}
