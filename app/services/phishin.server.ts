import axios from "axios";

const client = axios.create({
  baseURL: "https://phish.in/api/v2",
  timeout: 30000,
});

const RATE_LIMIT_MS = 200;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// -- Response types matching Phish.in API v2 --

export interface PhishinVenue {
  slug: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

export interface PhishinSong {
  slug: string;
  title: string;
  original: boolean;
  artist: string | null;
}

export interface PhishinTrack {
  slug: string;
  title: string;
  set_name: string;
  position: number;
  duration: number | null;
  songs: PhishinSong[];
}

export interface PhishinShowSummary {
  date: string;
  duration: number | null;
  tour_name: string | null;
  taper_notes: string | null;
  venue: PhishinVenue;
}

export interface PhishinShowDetail extends PhishinShowSummary {
  tracks: PhishinTrack[];
}

// -- Fetchers --

// The API returns paginated data under a named key (e.g. "shows", "songs")
// matching the endpoint path segment.
interface PhishinPaginatedResponse {
  total_pages: number;
  current_page: number;
  total_entries: number;
  [key: string]: unknown;
}

async function fetchAllPages<T>(
  endpoint: string,
  resourceKey: string,
  perPage = 100
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    await delay(RATE_LIMIT_MS);
    const { data } = await client.get<PhishinPaginatedResponse>(endpoint, {
      params: { per_page: perPage, page },
    });
    const items = data[resourceKey] as T[];
    all.push(...items);
    totalPages = data.total_pages;
    page++;
  } while (page <= totalPages);

  return all;
}

export async function fetchAllShows(): Promise<PhishinShowSummary[]> {
  return fetchAllPages<PhishinShowSummary>("/shows", "shows");
}

export async function fetchShowDetail(
  date: string
): Promise<PhishinShowDetail> {
  await delay(RATE_LIMIT_MS);
  // Show detail returns the show object directly at the top level
  const { data } = await client.get<PhishinShowDetail>(`/shows/${date}`);
  return data;
}

export async function fetchAllSongs(): Promise<PhishinSong[]> {
  return fetchAllPages<PhishinSong>("/songs", "songs");
}
