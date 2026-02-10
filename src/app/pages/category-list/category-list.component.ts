import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, switchMap, tap, forkJoin } from 'rxjs';
import { MovieService } from '../../services/movie.service';
import { MovieListItem, Pagination, Genre, Country, SearchFilters } from '../../models/movie.model';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [FormsModule, MovieCardComponent, SkeletonComponent],
  styleUrl: './category-list.component.scss',
  template: `
    <div class="category-page">
      <h1 class="category-title">{{ pageTitle() }}</h1>

      <!-- Advanced Filter Panel (only for category/country pages) -->
      @if (showFilters()) {
        <div class="filter-panel">
          <div class="filter-row">
            <!-- Category (for country pages) -->
            @if (filterMode() === 'country') {
              <div class="filter-group">
                <label class="filter-label">Thể loại</label>
                <select [(ngModel)]="filters.category" class="filter-select">
                  <option value="">Tất cả</option>
                  @for (cat of categories(); track cat.slug) {
                    <option [value]="cat.slug">{{ cat.name }}</option>
                  }
                </select>
              </div>
            }

            <!-- Country (for category pages) -->
            @if (filterMode() === 'category') {
              <div class="filter-group">
                <label class="filter-label">Quốc gia</label>
                <select [(ngModel)]="filters.country" class="filter-select">
                  <option value="">Tất cả</option>
                  @for (c of countries(); track c.slug) {
                    <option [value]="c.slug">{{ c.name }}</option>
                  }
                </select>
              </div>
            }

            <!-- Year -->
            <div class="filter-group">
              <label class="filter-label">Năm</label>
              <select [(ngModel)]="filters.year" class="filter-select">
                <option value="">Tất cả</option>
                @for (y of yearOptions; track y) {
                  <option [value]="y">{{ y }}</option>
                }
              </select>
            </div>

            <!-- Sort Field -->
            <div class="filter-group">
              <label class="filter-label">Sắp xếp</label>
              <select [(ngModel)]="filters.sortField" class="filter-select">
                <option value="modified.time">Cập nhật</option>
                <option value="year">Năm</option>
              </select>
            </div>

            <!-- Sort Type -->
            <div class="filter-group">
              <label class="filter-label">Thứ tự</label>
              <select [(ngModel)]="filters.sortType" class="filter-select">
                <option value="desc">Giảm dần</option>
                <option value="asc">Tăng dần</option>
              </select>
            </div>

            <!-- Buttons -->
            <div class="filter-group filter-group--actions">
              <button (click)="applyFilters()" class="btn-filter btn-filter--primary">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
                Lọc
              </button>
              <button (click)="resetFilters()" class="btn-filter btn-filter--secondary">
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="category-grid">
          @for (i of skeletonArray; track i) {
            <app-skeleton variant="card" />
          }
        </div>
      } @else {
        <div class="category-grid">
          @for (movie of movies(); track movie._id) {
            <app-movie-card [movie]="movie" />
          }
        </div>

        @if (pagination()) {
          <div class="pagination">
            <button (click)="goToPage(currentPage() - 1)"
                    [disabled]="currentPage() <= 1"
                    class="pagination-btn">
              ← Trước
            </button>

            <span class="pagination-info">
              Trang {{ currentPage() }} / {{ pagination()!.totalPages }}
            </span>

            <button (click)="goToPage(currentPage() + 1)"
                    [disabled]="currentPage() >= (pagination()?.totalPages ?? 1)"
                    class="pagination-btn">
              Sau →
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class CategoryListComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly movieService = inject(MovieService);
  private readonly destroy$ = new Subject<void>();

  loading = signal(true);
  movies = signal<MovieListItem[]>([]);
  pagination = signal<Pagination | undefined>(undefined);
  currentPage = signal(1);
  pageTitle = signal('');

  // Filter data
  categories = signal<Genre[]>([]);
  countries = signal<Country[]>([]);
  showFilters = signal(false);
  filterMode = signal<'category' | 'country' | 'none'>('none'); // 'category' means we're on a category page (show country filter)

  // Filters
  filters: Partial<SearchFilters> = {
    page: 1,
    sortField: 'modified.time',
    sortType: 'desc',
    category: '',
    country: '',
    year: '',
  };

  // Year options
  yearOptions: number[] = [];

  readonly skeletonArray = Array.from({ length: 18 }, (_, i) => i);

  private categorySlug = '';
  private isCountryPage = false;

  private readonly titleMap: Record<string, string> = {
    'phim-bo': '📺 Phim Bộ',
    'phim-le': '🎬 Phim Lẻ',
    'hoat-hinh': '✨ Hoạt Hình',
    'tv-shows': '📡 TV Shows',
  };

  // Predefined categories that use special endpoints (no filters)
  private readonly predefinedCategories = ['phim-bo', 'phim-le', 'hoat-hinh', 'tv-shows'];

  ngOnInit(): void {
    // Generate year options (2000 to current year)
    const currentYear = new Date().getFullYear();
    this.yearOptions = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

    // Load filter data (API returns arrays directly)
    forkJoin({
      categories: this.movieService.getCategories(),
      countries: this.movieService.getCountries(),
    }).subscribe({
      next: ({ categories, countries }) => {
        this.categories.set(categories ?? []);
        this.countries.set(countries ?? []);
      },
    });

    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        tap((params) => {
          this.categorySlug = params['slug'];
          this.pageTitle.set(this.titleMap[this.categorySlug] ?? this.categorySlug);
          this.currentPage.set(1);
          this.filters.page = 1;
          this.loading.set(true);
          window.scrollTo({ top: 0 });
        }),
        switchMap((params) => this.fetchMovies(params['slug'], 1))
      )
      .subscribe({
        next: (res) => this.handleResponse(res),
        error: () => this.loading.set(false),
      });

    // Determine if this is a country page based on route
    this.route.url.pipe(takeUntil(this.destroy$)).subscribe((segments) => {
      this.isCountryPage = segments.some((s) => s.path === 'quoc-gia');
      const isPredefined = this.predefinedCategories.includes(this.categorySlug);

      if (this.isCountryPage) {
        this.showFilters.set(true);
        this.filterMode.set('country'); // Show category filter for country pages
      } else if (!isPredefined) {
        // It's a category page (not predefined)
        this.showFilters.set(true);
        this.filterMode.set('category'); // Show country filter for category pages
      } else {
        this.showFilters.set(false);
        this.filterMode.set('none');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.filters.page = 1;
    this.loading.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.fetchMoviesWithFilters().subscribe({
      next: (res) => this.handleResponse(res),
      error: () => this.loading.set(false),
    });
  }

  resetFilters(): void {
    this.filters = {
      page: 1,
      sortField: 'modified.time',
      sortType: 'desc',
      category: '',
      country: '',
      year: '',
    };
    this.applyFilters();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.filters.page = page;
    this.loading.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (this.showFilters()) {
      this.fetchMoviesWithFilters().subscribe({
        next: (res) => this.handleResponse(res),
        error: () => this.loading.set(false),
      });
    } else {
      this.fetchMovies(this.categorySlug, page).subscribe({
        next: (res) => this.handleResponse(res),
        error: () => this.loading.set(false),
      });
    }
  }

  private fetchMoviesWithFilters() {
    if (this.isCountryPage) {
      return this.movieService.getByCountry(this.categorySlug, this.filters);
    } else {
      return this.movieService.getByCategory(this.categorySlug, this.filters);
    }
  }

  private fetchMovies(slug: string, page: number) {
    switch (slug) {
      case 'phim-bo':
        return this.movieService.getSeriesList(page);
      case 'phim-le':
        return this.movieService.getSingleMovies(page);
      case 'hoat-hinh':
        return this.movieService.getAnimationList(page);
      case 'tv-shows':
        return this.movieService.getTvShows(page);
      default:
        // For custom categories/countries, use filters
        if (this.isCountryPage) {
          return this.movieService.getByCountry(slug, { page });
        }
        return this.movieService.getByCategory(slug, { page });
    }
  }

  private handleResponse(res: any): void {
    this.movies.set(res.data?.items ?? []);
    this.pagination.set(res.data?.params?.pagination);
    if (res.data?.titlePage) {
      this.pageTitle.set(res.data.titlePage);
    }
    this.loading.set(false);
  }
}
