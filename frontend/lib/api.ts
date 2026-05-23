import { Platform } from 'react-native';

const API_BASE_URL = process.env.API_BASE_URL || '';

export interface Place {
  id: string;
  name: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  price_level?: number;
  rating?: number;
  category_id?: string;
  distanceKm?: number;
  rating_count?: number;
}

export interface Review {
  id: string;
  user_id: string;
  place_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getPlaces: () => request<{ data: Place[] }>('/places'),
  getPlaceById: (id: string) => request<{ data: Place & { reviews: Review[] } }>(`/places/${id}`),
  searchPlaces: (params: { q?: string; categories?: string[]; min_price?: number; max_price?: number }) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.categories?.length) searchParams.append('categories', params.categories.join(','));
    if (params.min_price !== undefined) searchParams.append('min_price', params.min_price.toString());
    if (params.max_price !== undefined) searchParams.append('max_price', params.max_price.toString());
    return request<{ data: Place[] }>(`/search?${searchParams.toString()}`);
  },
  getNearby: (lat: number, lng: number, radius = 5) => {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radius) });
    return request<{ data: Place[] }>(`/nearby?${params.toString()}`);
  },
  submitReview: (payload: { user_id: string; place_id: string; rating: number; comment?: string }) =>
    request<{ data: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
