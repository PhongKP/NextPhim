import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { MovieService } from '../../services/movie.service';
import { MovieListItem, Genre, Country, SearchFilters, Pagination } from '../../models/movie.model';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, MovieCardComponent, SkeletonComponent],
  styleUrl: './search.component.scss',
  template: `
    <div class="search-page">
      <h1 class="search-title">Tìm kiếm phim</h1>

      <!-- Filter Panel -->
      <div class="filter-panel">
        <div class="filter-row">
          <!-- Keyword -->
          <div class="filter-group filter-group--wide">
            <label class="filter-label">Từ khóa</label>
            <input type="text"
                   [(ngModel)]="filters.keyword"
                   (keydown.enter)="applyFilters()"
                   placeholder="Nhập tên phim..."
                   class="filter-input" />
          </div>

          <!-- Category -->
          <div class="filter-group">
            <label class="filter-label">Thể loại</label>
            <select [(ngModel)]="filters.category" class="filter-select">
              <option value="">Tất cả</option>
              @for (cat of categories(); track cat.slug) {
                <option [value]="cat.slug">{{ cat.name }}</option>
              }
            </select>
          </div>

          <!-- Country -->
          <div class="filter-group">
            <label class="filter-label">Quốc gia</label>
            <select [(ngModel)]="filters.country" class="filter-select">
              <option value="">Tất cả</option>
              @for (c of countries(); track c.slug) {
                <option [value]="c.slug">{{ c.name }}</option>
              }
            </select>
          </div>

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
        </div>

        <div class="filter-row">
          <!-- Sort Field -->
          <div class="filter-group">
            <label class="filter-label">Sắp xếp theo</label>
            <select [(ngModel)]="filters.sortField" class="filter-select">
              <option value="modified.time">Thời gian cập nhật</option>
              <option value="year">Năm phát hành</option>
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Tìm kiếm
            </button>
            <button (click)="resetFilters()" class="btn-filter btn-filter--secondary">
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      <!-- Active Filters Display -->
      @if (hasActiveFilters()) {
        <div class="active-filters">
          <span class="active-filters-label">Bộ lọc:</span>
          @if (filters.keyword) {
            <span class="filter-tag">
              Từ khóa: {{ filters.keyword }}
              <button (click)="removeFilter('keyword')" class="filter-tag-remove">×</button>
            </span>
          }
          @if (filters.category) {
            <span class="filter-tag">
              Thể loại: {{ getCategoryName(filters.category) }}
              <button (click)="removeFilter('category')" class="filter-tag-remove">×</button>
            </span>
          }
          @if (filters.country) {
            <span class="filter-tag">
              Quốc gia: {{ getCountryName(filters.country) }}
              <button (click)="removeFilter('country')" class="filter-tag-remove">×</button>
            </span>
          }
          @if (filters.year) {
            <span class="filter-tag">
              Năm: {{ filters.year }}
              <button (click)="removeFilter('year')" class="filter-tag-remove">×</button>
            </span>
          }
        </div>
      }

      <!-- Results Meta -->
      @if (!loading() && searched()) {
        <p class="search-meta">
          Tìm thấy {{ totalItems() }} kết quả
          @if (pagination()) {
            — Trang {{ pagination()!.currentPage }} / {{ pagination()!.totalPages }}
          }
        </p>
      }

      <!-- Results -->
      @if (loading()) {
        <div class="results-grid">
          @for (i of skeletonArray; track i) {
            <app-skeleton variant="card" />
          }
        </div>
      } @else if (!searched()) {
        <div class="search-empty">
          <div class="search-empty-icon">🎬</div>
          <p class="search-empty-title">Tìm kiếm phim yêu thích của bạn</p>
          <p class="search-empty-hint">Sử dụng bộ lọc ở trên để tìm kiếm phim.</p>
        </div>
      } @else if (results().length === 0) {
        <div class="search-empty">
          <div class="search-empty-icon">🔍</div>
          <p class="search-empty-title">Không tìm thấy phim nào.</p>
          <p class="search-empty-hint">Hãy thử thay đổi bộ lọc hoặc từ khóa khác.</p>
        </div>
      } @else {
        <div class="results-grid">
          @for (movie of results(); track movie._id) {
            <app-movie-card [movie]="movie" />
          }
        </div>

        <!-- Pagination -->
        @if (pagination() && pagination()!.totalPages > 1) {
          <div class="pagination">
            <button (click)="goToPage(1)"
                    [disabled]="filters.page <= 1"
                    class="pagination-btn">
              ⟪
            </button>
            <button (click)="goToPage(filters.page - 1)"
                    [disabled]="filters.page <= 1"
                    class="pagination-btn">
              ←
            </button>

            <span class="pagination-info">
              Trang {{ filters.page }} / {{ pagination()!.totalPages }}
            </span>

            <button (click)="goToPage(filters.page + 1)"
                    [disabled]="filters.page >= pagination()!.totalPages"
                    class="pagination-btn">
              →
            </button>
            <button (click)="goToPage(pagination()!.totalPages)"
                    [disabled]="filters.page >= pagination()!.totalPages"
                    class="pagination-btn">
              ⟫
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class SearchComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly movieService = inject(MovieService);
  private readonly destroy$ = new Subject<void>();

  // Filter state
  filters: SearchFilters = {
    keyword: '',
    page: 1,
    limit: 12,
    sortField: 'modified.time',
    sortType: 'desc',
    sortLang: '',
    category: '',
    country: '',
    year: '',
  };

  // Data
  categories = signal<Genre[]>([]);
  countries = signal<Country[]>([]);
  results = signal<MovieListItem[]>([]);
  pagination = signal<Pagination | undefined>(undefined);
  totalItems = signal(0);

  // UI state
  loading = signal(false);
  searched = signal(false);

  // Year options (current year down to 1990)
  yearOptions: number[] = [];

  // Skeleton array based on limit
  get skeletonArray(): number[] {
    return Array.from({ length: this.filters.limit }, (_, i) => i);
  }

  ngOnInit(): void {
    // Generate year options (2000 to current year)
    const currentYear = new Date().getFullYear();
    this.yearOptions = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

    // Load categories and countries (API returns arrays directly)
    forkJoin({
      categories: this.movieService.getCategories(),
      countries: this.movieService.getCountries(),
    }).subscribe({
      next: ({ categories, countries }) => {
        this.categories.set(categories ?? []);
        this.countries.set(countries ?? []);
      },
    });

    // Check for initial query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['keyword']) {
        this.filters.keyword = params['keyword'];
        this.applyFilters();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilters(): void {
    this.loading.set(true);
    this.searched.set(true);
    this.filters.page = 1;

    this.performSearch();
  }

  goToPage(page: number): void {
    this.filters.page = page;
    this.loading.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.performSearch();
  }

  private performSearch(): void {
    // Determine which API to use based on filters
    let request$;

    if (this.filters.keyword) {
      // Has keyword - use search API (can combine with other filters)
      request$ = this.movieService.searchMovies(this.filters);
    } else if (this.filters.category) {
      // Category selected - use category API (can include country, year filters)
      request$ = this.movieService.getByCategory(this.filters.category, this.filters);
    } else if (this.filters.country) {
      // Country selected - use country API (can include category, year filters)
      request$ = this.movieService.getByCountry(this.filters.country, this.filters);
    } else if (this.filters.year) {
      // Only year selected - use year API
      request$ = this.movieService.getByYear(this.filters.year, this.filters);
    } else {
      // No filters - show empty state
      this.results.set([]);
      this.loading.set(false);
      this.searched.set(false);
      return;
    }

    request$.subscribe({
      next: (res) => {
        this.results.set(res.data?.items ?? []);
        this.pagination.set(res.data?.params?.pagination);
        this.totalItems.set(res.data?.params?.pagination?.totalItems ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.results.set([]);
        this.loading.set(false);
      },
    });
  }

  resetFilters(): void {
    this.filters = {
      keyword: '',
      page: 1,
      limit: 12,
      sortField: 'modified.time',
      sortType: 'desc',
      sortLang: '',
      category: '',
      country: '',
      year: '',
    };
    this.searched.set(false);
    this.results.set([]);
    this.pagination.set(undefined);
  }

  removeFilter(key: keyof SearchFilters): void {
    if (key === 'keyword') this.filters.keyword = '';
    else if (key === 'category') this.filters.category = '';
    else if (key === 'country') this.filters.country = '';
    else if (key === 'year') this.filters.year = '';

    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.keyword ||
      this.filters.category ||
      this.filters.country ||
      this.filters.year
    );
  }

  getCategoryName(slug: string): string {
    return this.categories().find((c) => c.slug === slug)?.name ?? slug;
  }

  getCountryName(slug: string): string {
    return this.countries().find((c) => c.slug === slug)?.name ?? slug;
  }
}
