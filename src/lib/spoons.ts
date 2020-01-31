import axios from 'axios';
import _ from 'lodash';
import apiData from '../spoons.json';
import { LatLng } from './distance.js';

export async function findPubs(location: LatLng): Promise<Pub[]> {
  const response = await axios.post<{ results: Pub[] }>('https://www.jdwetherspoon.com/api/advancedsearch', {
    location,
    paging: {
      numberPerPage: 30,
      page: 0,
      UsePagination: true
    },
  });

  return response.data.results;
}

export function getAllPubs(): Pub[] {
  return _.flatten(_.flatten(_.map(apiData.regions, 'subRegions')).map(region => region.items)); // Fix this dumb shit
}

export interface Pub {
  PubIsClosed: boolean;
  PubIsTemporaryClosed: boolean;
  address1: string;
  city: string;
  county: string;
  distanceTo: number;
  distanceToNext?: number;
  facilities: string[];
  id: string;
  isAirport: boolean;
  isHotel: boolean;
  lat: number;
  lng: number;
  name: string;
  postcode: string;
  summary: string;
  telephone: string;
  url: string;
}
