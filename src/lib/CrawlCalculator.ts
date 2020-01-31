import _ from 'lodash';
import { Pub } from '../lib/spoons';
import { milesToMeters } from './distance';

export default class CrawlCalculator {
  /**
   * List of all Wetherspoons pubs
   */
  public pubs: Pub[];

  /**
   * Start location
   */
  public start: google.maps.LatLng;

  /**
   * Optional end location
   */
  public end?: google.maps.LatLng;

  /**
   * Create a new pub crawl calculator.
   *
   * @param pubs
   * @param start
   */
  public constructor(pubs: Pub[], start: google.maps.LatLng) {
    this.pubs = pubs;
    this.start = start;
  }

  /**
   * Set an optional end location.
   *
   * @param end
   */
  public setEnd(end: google.maps.LatLng) {
    this.end = end;
  }

  /**
   * Generate a list of pubs for this crawl.
   *
   * @param pubLimit
   * @param distanceLimit
   */
  public getCrawlPubs(pubLimit: number, distanceLimit: number) {
    if (this.end) {
      return this.budgetShortestPathFistMethod(pubLimit, distanceLimit);
    }

    return this.nearestPubNextMethod(pubLimit, distanceLimit);
  }

  /**
   * Create a pub crawl route based on finding the next nearest pub.
   *
   * @param start
   * @param allPubs
   * @param pubLimit
   * @param distanceLimit
   */
  private nearestPubNextMethod(pubLimit: number, distanceLimit: number) {
    const crawlPubs = [];
    const availablePubs = this.pubs;

    let nextPub = this.shiftClosestPub(this.start, availablePubs);

    for (let i=0; i < pubLimit; i++) {
      console.log('Adding', nextPub);

      crawlPubs.push(nextPub);

      nextPub = this.shiftClosestPub(new google.maps.LatLng(nextPub.lat, nextPub.lng), availablePubs);

      if(google.maps.geometry.spherical.computeDistanceBetween(this.start, new google.maps.LatLng(nextPub.lat, nextPub.lng)) > milesToMeters(distanceLimit)) {
        break;
      }
    }

    return crawlPubs;
  }

  /**
   * Create a pub crawl route based on finding the next nearest pub that is also closest to the end point.
   *
   * @param start
   * @param allPubs
   * @param pubLimit
   * @param distanceLimit
   */
  private budgetShortestPathFistMethod(pubLimit: number, distanceLimit: number) {
    if (!this.end) {
      return []
    }

    const crawlPubs = [];
    const availablePubs = this.pubs;

    const startPub = this.shiftClosestPub(this.start, availablePubs);
    crawlPubs.push(startPub);

    console.log('Start', startPub);

    const endPub = this.getClosestPub(this.end, availablePubs);

    console.log('End', endPub);

    let testPubs = this.getClosestPubs(this.start, availablePubs, 5);
    let nextPub = this.shiftClosestPub(this.end, testPubs);
    _.remove(availablePubs, pub => pub.id === nextPub.id);
    console.log('Next', nextPub);

    while (nextPub.id !== endPub.id) {
      crawlPubs.push(nextPub);

      testPubs = this.getClosestPubs(new google.maps.LatLng(nextPub.lat, nextPub.lng), availablePubs, 5);
      nextPub = this.shiftClosestPub(this.end, testPubs);
      console.log('Next', nextPub);
      _.remove(availablePubs, pub => pub.id === nextPub.id);
    }

    crawlPubs.push(endPub);

    return crawlPubs;
  }

  /**
   * Given a LatLon sort Pubs by distance to it.
   *
   * @param start
   * @param pubs
   */
  private sortPubsByDistanceTo(start: google.maps.LatLng, pubs: Pub[]): void {
    pubs.sort((a, b) => {
      a.distanceToNext = google.maps.geometry.spherical.computeDistanceBetween(start, new google.maps.LatLng(Number(a.lat), Number(a.lng)));
      b.distanceToNext = google.maps.geometry.spherical.computeDistanceBetween(start, new google.maps.LatLng(Number(b.lat), Number(b.lng)));

      return a.distanceToNext - b.distanceToNext;
    });
  }

  /**
   * Given a LatLon find the closest pub and remove it from the given list of Pubs.
   *
   * @param start
   * @param pubs
   */
  private shiftClosestPub(start: google.maps.LatLng, pubs: Pub[]): Pub {
    this.sortPubsByDistanceTo(start, pubs);

    return pubs.shift() as Pub;
  }

  /**
   * Given a LatLon find the closest pub from the given list of Pubs.
   *
   * @param start
   * @param pubs
   */
  private getClosestPub(start: google.maps.LatLng, pubs: Pub[]): Pub {
    this.sortPubsByDistanceTo(start, pubs);

    return pubs[0];
  }

  /**
   * Given a LatLon find the closest pub and remove it from the given list of Pubs.
   *
   * @param start
   * @param pubs
   */
  private getClosestPubs(start: google.maps.LatLng, pubs: Pub[], limit: number = 10): Pub[] {
    this.sortPubsByDistanceTo(start, pubs);

    return pubs.slice(0, limit);
  }
}
