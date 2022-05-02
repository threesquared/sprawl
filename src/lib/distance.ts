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
 * Class to represent a Lat/Lng pair
 */
export class LatLng {
  public lat: number;
  public lng: number;

  public constructor(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
  }

  public toJSON() {
    return {
      lat: this.lat,
      lng: this.lng,
    };
  }
}
