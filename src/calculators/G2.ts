import _ from 'lodash';
import jsgraphs, { WeightedGraph } from 'js-graph-algorithms';
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

  /**
   * Ending point
   */
  public end?: LatLng;

  public constructor(pubs: Pub[]) {
    this.pubs = pubs;
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

    const pubs = this.getPubsWithinMiles(this.start, distanceLimit);
    const graph = this.generateGraph(pubs);

    const startPub = this.getClosestPubs(this.pubs, this.start)[0];
    const endPub = this.getClosestPubs(this.pubs, this.end)[0];

    var dijkstra = new jsgraphs.Dijkstra(graph, this.getPubIndex(pubs, startPub));

    const endIndex = this.getPubIndex(pubs, endPub)

    if (dijkstra.hasPathTo(endIndex)){
      var path = dijkstra.pathTo(endIndex);

      const crawl = [pubs[path[0].from()]];

      path.forEach(edge => {
        crawl.push(pubs[edge.to()]);
      })

      console.log(crawl);

      return crawl;
    }

    console.log(endIndex);

    return [];
  }

  private generateGraph(pubs: Pub[]) {
    const graph = new jsgraphs.WeightedGraph(pubs.length);

    pubs.forEach((pub, index) => {
      console.log(`indexing pub ${index}`);

      const closest = this.getClosestPubs(pubs, new LatLng(pub.lat, pub.lng), 10, pub);

      closest.forEach(closePub => {
        const dist = computeDistanceBetween(new LatLng(pub.lat, pub.lng), new LatLng(closePub.lat, closePub.lng));
        const edge = new jsgraphs.Edge(index, this.getPubIndex(pubs, closePub), dist);

        console.log('klol', edge);

        graph.addEdge(edge);
      })
    })

    return graph;
  }

  private getClosestPubs(pubs: Pub[], point: LatLng, limit: number = 1, filterPub?: Pub): Pub[] {
    return [...pubs].filter(pub => {
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
