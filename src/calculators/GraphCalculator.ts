import jsgraphs, { WeightedGraph } from 'js-graph-algorithms';
import { computeDistanceBetween } from 'spherical-geometry-js';
import { LatLng } from '../lib/distance';
import { Pub } from '../lib/spoons';

export default class GraphThing {
  private pubs: Pub[];
  public start: LatLng;
  public end: LatLng;
  private graph: WeightedGraph;

  public constructor(pubs: Pub[], start: LatLng, end: LatLng) {
    this.pubs = pubs;
    this.start = start;
    this.end = end;
    this.graph = new jsgraphs.WeightedGraph(this.pubs.length);

    this.pubs.forEach((pub, index) => {
      console.log(`indexing pub ${index}`);

      const closest = this.getClosestPubs(new LatLng(pub.lat, pub.lng), 5);

      closest.forEach((closePub) => {
        const dist = computeDistanceBetween(pub, closePub);
        const edge = new jsgraphs.Edge(index, this.getPubIndex(closePub), dist);

        this.graph.addEdge(edge);
      });
    });
  }

  public getCrawlPubs(): Pub[] {
    const startPub = this.getClosestPubs(this.start)[0];
    const endPub = this.getClosestPubs(this.end)[0];

    var dijkstra = new jsgraphs.Dijkstra(this.graph, this.getPubIndex(startPub));

    const endIndex = this.getPubIndex(endPub);

    if (dijkstra.hasPathTo(endIndex)) {
      var path = dijkstra.pathTo(endIndex);

      const crawl = [this.pubs[path[0].from()]];

      path.forEach((edge) => {
        crawl.push(this.pubs[edge.to()]);
      });

      return crawl;
    }

    return [];
  }

  private getClosestPubs(point: LatLng, limit: number = 1): Pub[] {
    return [...this.pubs]
      .sort((a, b) => {
        a.distanceToNext = computeDistanceBetween(point, new LatLng(Number(a.lat), Number(a.lng)));
        b.distanceToNext = computeDistanceBetween(point, new LatLng(Number(b.lat), Number(b.lng)));

        return a.distanceToNext - b.distanceToNext;
      })
      .slice(0, limit);
  }

  private getPubIndex(pub: Pub): number {
    return this.pubs.findIndex((testPub) => testPub.id === pub.id);
  }
}
