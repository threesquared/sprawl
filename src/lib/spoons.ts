import axios from 'axios';

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

export interface LatLng {
  lng: number,
  lat: number
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
