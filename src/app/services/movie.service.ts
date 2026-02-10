import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import {
  LatestMoviesResponse,
  MovieDetailResponse,
  V1MovieListResponse,
  SearchFilters,
  Genre,
  Country,
} from '../models/movie.model';

const API_BASE = 'https://phimapi.com';
const V1_API = `${API_BASE}/v1/api`;
const DEFAULT_LIMIT = 12;

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly http = inject(HttpClient);

  // Cache for categories and countries (API returns arrays directly)
  private categoriesCache$?: Observable<Genre[]>;
  private countriesCache$?: Observable<Country[]>;

  // ── Get Categories ───────────────────────────────────────────
  getCategories(): Observable<Genre[]> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.http.get<Genre[]>(`${API_BASE}/the-loai`).pipe(shareReplay(1));
    }
    return this.categoriesCache$;
  }

  // ── Get Countries ────────────────────────────────────────────
  getCountries(): Observable<Country[]> {
    if (!this.countriesCache$) {
      this.countriesCache$ = this.http.get<Country[]>(`${API_BASE}/quoc-gia`).pipe(shareReplay(1));
    }
    return this.countriesCache$;
  }

  // ── Latest Updated Movies ────────────────────────────────────
  getLatestMovies(page = 1): Observable<LatestMoviesResponse> {
    return this.http.get<LatestMoviesResponse>(
      `${API_BASE}/danh-sach/phim-moi-cap-nhat`,
      { params: new HttpParams().set('page', page) }
    );
  }

  // ── Movie Detail by Slug ─────────────────────────────────────
  getMovieDetail(slug: string): Observable<MovieDetailResponse> {
    return this.http.get<MovieDetailResponse>(`${API_BASE}/phim/${slug}`);
  }

  // ── Search Movies (with Filters) ─────────────────────────────
  searchMovies(filters: Partial<SearchFilters>): Observable<V1MovieListResponse> {
    let params = new HttpParams();

    if (filters.keyword) params = params.set('keyword', filters.keyword);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.limit) params = params.set('limit', filters.limit);
    if (filters.sortField) params = params.set('sort_field', filters.sortField);
    if (filters.sortType) params = params.set('sort_type', filters.sortType);
    if (filters.sortLang) params = params.set('sort_lang', filters.sortLang);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.country) params = params.set('country', filters.country);
    if (filters.year) params = params.set('year', filters.year);

    return this.http.get<V1MovieListResponse>(`${V1_API}/tim-kiem`, { params });
  }

  // ── Categorized Lists ────────────────────────────────────────
  getSeriesList(page = 1, limit = DEFAULT_LIMIT): Observable<V1MovieListResponse> {
    return this.http.get<V1MovieListResponse>(
      `${V1_API}/danh-sach/phim-bo`,
      { params: new HttpParams().set('page', page).set('limit', limit) }
    );
  }

  getSingleMovies(page = 1, limit = DEFAULT_LIMIT): Observable<V1MovieListResponse> {
    return this.http.get<V1MovieListResponse>(
      `${V1_API}/danh-sach/phim-le`,
      { params: new HttpParams().set('page', page).set('limit', limit) }
    );
  }

  getAnimationList(page = 1, limit = DEFAULT_LIMIT): Observable<V1MovieListResponse> {
    return this.http.get<V1MovieListResponse>(
      `${V1_API}/danh-sach/hoat-hinh`,
      { params: new HttpParams().set('page', page).set('limit', limit) }
    );
  }

  getTvShows(page = 1, limit = DEFAULT_LIMIT): Observable<V1MovieListResponse> {
    return this.http.get<V1MovieListResponse>(
      `${V1_API}/danh-sach/tv-shows`,
      { params: new HttpParams().set('page', page).set('limit', limit) }
    );
  }

  // ── By Category Slug (with filters) ──────────────────────────
  getByCategory(categorySlug: string, filters: Partial<SearchFilters> = {}): Observable<V1MovieListResponse> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page);
    if (filters.sortField) params = params.set('sort_field', filters.sortField);
    if (filters.sortType) params = params.set('sort_type', filters.sortType);
    if (filters.sortLang) params = params.set('sort_lang', filters.sortLang);
    if (filters.country) params = params.set('country', filters.country);
    if (filters.year) params = params.set('year', filters.year);
    if (filters.limit) params = params.set('limit', filters.limit);

    return this.http.get<V1MovieListResponse>(`${V1_API}/the-loai/${categorySlug}`, { params });
  }

  // ── By Country Slug (with filters) ───────────────────────────
  getByCountry(countrySlug: string, filters: Partial<SearchFilters> = {}): Observable<V1MovieListResponse> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page);
    if (filters.sortField) params = params.set('sort_field', filters.sortField);
    if (filters.sortType) params = params.set('sort_type', filters.sortType);
    if (filters.sortLang) params = params.set('sort_lang', filters.sortLang);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.year) params = params.set('year', filters.year);
    if (filters.limit) params = params.set('limit', filters.limit);

    return this.http.get<V1MovieListResponse>(`${V1_API}/quoc-gia/${countrySlug}`, { params });
  }

  // ── By Year (with filters) ───────────────────────────────────
  getByYear(year: string, filters: Partial<SearchFilters> = {}): Observable<V1MovieListResponse> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page);
    if (filters.sortField) params = params.set('sort_field', filters.sortField);
    if (filters.sortType) params = params.set('sort_type', filters.sortType);
    if (filters.sortLang) params = params.set('sort_lang', filters.sortLang);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.country) params = params.set('country', filters.country);
    if (filters.limit) params = params.set('limit', filters.limit);

    return this.http.get<V1MovieListResponse>(`${V1_API}/nam/${year}`, { params });
  }
}
