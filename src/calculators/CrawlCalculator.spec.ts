import { Pub } from '../components/App';
import CrawlCalculator from './CrawlCalculator';

const getAllPubs = () => {
  const pubs: Pub[] = [
    {
      id: '1',
      name: 'Pub 1',
      location: {
        lat: 51.509865,
        lng: -0.118092,
      },
    },
    {
      id: '2',
      name: 'Pub 2',
      location: {
        lat: 51.509865,
        lng: -0.118092,
      },
    },
  ];
  return pubs;
};

describe('crawl calculator', () => {
  describe('with no end', () => {
    let pubs: Pub[];

    beforeEach(() => {
      const start: any = { lat: () => 51.592872799999995, lng: () => -0.0759431000000177 };
      const calculator = new CrawlCalculator(getAllPubs(), start);

      pubs = calculator.getCrawlPubs(10, 10);
    });

    it('generates the right number of pubs', () => {
      expect(pubs).toHaveLength(10);
    });

    it('begins with the closest pub to the start', () => {
      expect(pubs[0].id).toEqual('e673d615-c964-414d-a52e-a314e5a844e2');
    });

    it('ends with the same pub', () => {
      expect(pubs[pubs.length - 1].id).toEqual('d35c8317-3894-4519-8564-2bfb5ca60196');
    });
  });

  describe('with an end', () => {
    let pubs: Pub[];

    beforeEach(() => {
      const start: any = { lat: () => 51.581307538616144, lng: () => -0.03786397066346581 };
      const end: any = { lat: () => 51.49996329430803, lng: () => -0.10365439619420158 };
      const calculator = new CrawlCalculator(getAllPubs(), start);
      calculator.setEnd(end);

      pubs = calculator.getCrawlPubs(10, 10);
    });

    it('generates the same number of pubs', () => {
      expect(pubs).toHaveLength(6);
    });

    it('begins with the closest pub to the start', () => {
      expect(pubs[0].id).toEqual('e0e38e0e-97c5-4631-9588-e7c7cc7e11fd');
    });

    it('ends with the same pub', () => {
      expect(pubs[pubs.length - 1].id).toEqual('68de16fb-0630-4250-99c5-d7353c27bc50');
    });
  });
});
