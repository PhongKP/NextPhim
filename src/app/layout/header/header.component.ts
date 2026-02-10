import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  styleUrl: './header.component.scss',
  template: `
    <header class="header" [class.scrolled]="scrolled()" [class.transparent]="!scrolled()">
      <div class="header-inner">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <span class="logo-text">
            <span class="logo-accent">NEXT</span><span class="logo-white">PHIM</span>
          </span>
        </a>

        <!-- Nav Desktop -->
        <nav class="nav-desktop">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Trang chủ</a>
          <a routerLink="/danh-sach/phim-bo" routerLinkActive="active" class="nav-link">Phim Bộ</a>
          <a routerLink="/danh-sach/phim-le" routerLinkActive="active" class="nav-link">Phim Lẻ</a>
          <a routerLink="/danh-sach/hoat-hinh" routerLinkActive="active" class="nav-link">Hoạt Hình</a>
          <a routerLink="/danh-sach/tv-shows" routerLinkActive="active" class="nav-link">TV Shows</a>
        </nav>

        <!-- Right -->
        <div class="right-section">
          <div class="search-container" [class.open]="searchOpen()" [class.closed]="!searchOpen()">
            @if (searchOpen()) {
              <svg class="search-icon-inside" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text"
                     [(ngModel)]="searchQuery"
                     (keydown.enter)="performSearch()"
                     (keydown.escape)="searchOpen.set(false)"
                     placeholder="Tìm kiếm phim..."
                     class="search-input" />
            } @else {
              <button (click)="toggleSearch()" class="icon-btn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            }
          </div>

          <button (click)="mobileMenuOpen.set(!mobileMenuOpen())" class="mobile-toggle">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              @if (mobileMenuOpen()) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              }
            </svg>
          </button>
        </div>
      </div>

      @if (mobileMenuOpen()) {
        <nav class="mobile-menu">
          <a routerLink="/" (click)="mobileMenuOpen.set(false)" class="mobile-link">Trang chủ</a>
          <a routerLink="/danh-sach/phim-bo" (click)="mobileMenuOpen.set(false)" class="mobile-link">Phim Bộ</a>
          <a routerLink="/danh-sach/phim-le" (click)="mobileMenuOpen.set(false)" class="mobile-link">Phim Lẻ</a>
          <a routerLink="/danh-sach/hoat-hinh" (click)="mobileMenuOpen.set(false)" class="mobile-link">Hoạt Hình</a>
          <a routerLink="/danh-sach/tv-shows" (click)="mobileMenuOpen.set(false)" class="mobile-link">TV Shows</a>
        </nav>
      }
    </header>
  `,
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);

  scrolled = signal(false);
  searchOpen = signal(false);
  searchQuery = '';
  mobileMenuOpen = signal(false);

  private onScroll = () => {
    this.scrolled.set(window.scrollY > 50);
  };

  ngOnInit(): void {
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
  }

  toggleSearch(): void {
    this.searchOpen.update((v) => !v);
  }

  performSearch(): void {
    const q = this.searchQuery.trim();
    if (q) {
      this.router.navigate(['/tim-kiem'], { queryParams: { keyword: q } });
      this.searchOpen.set(false);
      this.searchQuery = '';
    }
  }
}
