// ============================================================
// KKPhim API - TypeScript Interfaces
// ============================================================

// ---------- Shared / Common ----------
export interface SeoOnPage {
  og_type: string;
  titleHead: string;
  descriptionHead: string;
  og_image: string[];
  og_url: string;
}

export interface BreadCrumb {
  name: string;
  slug: string;
  isCurrent: boolean;
  position: number;
}

export interface Pagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface CountryRef {
  id: string;
  name: string;
  slug: string;
}

// ---------- Movie List Item (from /danh-sach/* & /v1/api/tim-kiem) ----------
export interface MovieListItem {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  type: string;
  thumb_url: string;
  poster_url: string;
  sub_docquyen: boolean;
  chipifilmlong: boolean;
  time: string;
  episode_current: string;
  quality: string;
  lang: string;
  year: number;
  category: CategoryRef[];
  country: CountryRef[];
  modified: { time: string };
}

// ---------- Response: Latest Updated Movies ----------
export interface LatestMoviesResponse {
  status: boolean;
  items: MovieListItem[];
  pagination: Pagination;
}

// ---------- Response: v1 API (Search, Categories) ----------
export interface V1MovieListResponse {
  status: string;
  msg: string;
  data: {
    seoOnPage: SeoOnPage;
    breadCrumb: BreadCrumb[];
    titlePage: string;
    items: MovieListItem[];
    params: {
      type_slug: string;
      keyword: string;
      filterCategory: string[];
      filterCountry: string[];
      filterYear: string;
      filterType: string;
      sortField: string;
      sortType: string;
      pagination: Pagination;
    };
  };
}

// ---------- Episode / Server ----------
export interface EpisodeLink {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface EpisodeServer {
  server_name: string;
  server_data: EpisodeLink[];
}

// ---------- Movie Detail ----------
export interface MovieDetail {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  content: string;
  type: string;
  status: string;
  thumb_url: string;
  poster_url: string;
  is_copyright: boolean;
  sub_docquyen: boolean;
  chipifilmlong: boolean;
  trailer_url: string;
  time: string;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  notify: string;
  showtimes: string;
  year: number;
  view: number;
  actor: string[];
  director: string[];
  category: CategoryRef[];
  country: CountryRef[];
  created: { time: string };
  modified: { time: string };
}

// ---------- Response: Movie Detail ----------
export interface MovieDetailResponse {
  status: boolean;
  msg: string;
  movie: MovieDetail;
  episodes: EpisodeServer[];
}

// ---------- Category / Genre ----------
export interface Genre {
  _id: string;
  name: string;
  slug: string;
}

// API returns array directly
export type GenreListResponse = Genre[];

// ---------- Country ----------
export interface Country {
  _id: string;
  name: string;
  slug: string;
}

// API returns array directly
export type CountryListResponse = Country[];

// ---------- Search Filters ----------
export type SortField = 'modified.time' | 'year';
export type SortType = 'desc' | 'asc';

export interface SearchFilters {
  keyword: string;
  page: number;
  limit: number;
  sortField: SortField;
  sortType: SortType;
  sortLang: string;
  category: string;
  country: string;
  year: string;
}
