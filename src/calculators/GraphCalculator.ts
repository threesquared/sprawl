import _ from 'lodash';
import { Graph, Edge, alg } from 'graphlib';
import { computeDistanceBetween } from 'spherical-geometry-js';
import { LatLng, milesToMeters } from '../lib/distance';
import { Pub } from '../lib/spoons';

export default class GraphCalculator {

  /**
   * List of pubs
   */
  private pubs: Pub[];

  /**
   * Starting point
   */
  public start?: LatLng;

  private graph: Graph;

  /**
   * Ending point
   */
  public end?: LatLng;

  public constructor(pubs: Pub[]) {
    this.pubs = pubs;
    this.graph = new Graph({ directed: false });

    this.generateGraph();
  }

  public setStart(start: LatLng) {
    this.start = start;
  }

  public setEnd(end: LatLng) {
    this.end = end;
  }

  public getCrawlPubs(pubLimit: number, distanceLimit: number = 10): Pub[] {
    if(!this.start || !this.end) {
      return [];
    }

    const startPub = this.getClosestPubs(this.start)[0];
    const endPub = this.getClosestPubs(this.end)[0];

    const lol = alg.dijkstra(this.graph, startPub.id, (e: Edge): any => {

      const a = this.pubs.find(findPub => findPub.id === e.v);
      const b = this.pubs.find(findPub2 => findPub2.id === e.w);

      if (!a || !b) {
        return;
      }

      return computeDistanceBetween(new LatLng(a.lat, a.lng), new LatLng(b.lat, b.lng))

    }, (v: any): any => this.graph.nodeEdges(v));

    console.log(lol);

    return [];
  }

  private generateGraph() {
    this.pubs.forEach((pub, index) => {
      console.log(`indexing pub ${index}`);

        this.graph.setNode(pub.id);

        this.pubs.filter(filterPub => filterPub.id !== pub.id).forEach(subPub => {
          this.graph.setEdge(pub.id, subPub.id);
        })
    })
  }

  private getClosestPubs(point: LatLng, limit: number = 1, filterPub?: Pub): Pub[] {
    return this.pubs.filter(pub => {
      if (filterPub) {
        return filterPub.id !== pub.id;
      }
      return true;
    }).sort(((a, b) => {
      a.distanceToNext = computeDistanceBetween(point, new LatLng(Number(a.lat), Number(a.lng)));
      b.distanceToNext = computeDistanceBetween(point, new LatLng(Number(b.lat), Number(b.lng)));

      return a.distanceToNext - b.distanceToNext;
    })).slice(0, limit);
  }

  private getPubIndex(pubs: Pub[], pub: Pub): number {
    return pubs.findIndex(testPub => testPub.id === pub.id);
  }

  private getPubsWithinMiles(point: LatLng, distance: number = 10): Pub[] {
    return [...this.pubs].filter(((pub: Pub) => computeDistanceBetween(point, new LatLng(pub.lat, pub.lng)) < milesToMeters(distance)));
  }
}
