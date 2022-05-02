import { LatLng } from './distance'

/**
 * Find pubs and bars in a given area from Google Places
 *
 * @param service
 * @param location
 */
export async function findPubs(service: google.maps.places.PlacesService, location: LatLng): Promise<google.maps.places.PlaceResult[]> {
  var request = {
    query: 'pub',
    openNow: true,
    location: new google.maps.LatLng(location.lat, location.lng),
    radius: 5000,
    type: 'bar',
  };

  return new Promise((resolve, reject) => {
    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results);
      } else {
        reject(status);
      }
    });
  });
}
