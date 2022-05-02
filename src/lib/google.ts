import { LatLng } from './distance'
import { Loader } from '@googlemaps/js-api-loader';
import { Pub } from '../components/App';

const loader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY as string,
  version: "weekly",
  libraries: ["places"]
});

/**
 * Find pubs and bars in a given area from Google Places
 *
 * @param service
 * @param location
 */
export async function findPubs(location: LatLng): Promise<Pub[]> {
  const google = await loader.load();

  const places = google.maps.places;
  const service = new places.PlacesService(document.createElement('div'));

  const request = {
    query: 'pub',
    openNow: true,
    location,
    radius: 20000,
    type: 'bar',
    key: process.env.REACT_APP_GOOGLE_API_KEY as string
  };

  return new Promise((resolve, reject) => {
    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results.map(result => {
          return {
            id: result.place_id as string,
            name: result.name as string,
            address: result.formatted_address as string,
            location: new LatLng(result!.geometry!.location!.lat(), result!.geometry!.location!.lng()),
          }
        }));
      } else {
        reject(status);
      }
    });
  });
}
