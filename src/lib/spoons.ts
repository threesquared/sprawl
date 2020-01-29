import axios from 'axios';
import _ from 'lodash';
import LatLon from 'geodesy/latlon-spherical.js'
import apiData from '../spoons.json';

export async function findPubs(location: LatLon): Promise<Pub[]> {
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
