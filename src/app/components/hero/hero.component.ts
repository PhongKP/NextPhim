import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieListItem } from '../../models/movie.model';
import { OptimizedImagePipe } from '../../pipes/optimized-image.pipe';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, OptimizedImagePipe],
  styleUrl: './hero.component.scss',
  template: `
    @if (movie) {
      <section class="hero">
        <div class="hero-bg">
          <img [src]="movie.poster_url | optimizedImage:'poster'"
               [alt]="movie.name" />
        </div>

        <div class="hero-gradient-side"></div>
        <div class="hero-gradient-bottom"></div>
        <div class="hero-gradient-fade"></div>

        <div class="hero-content">
          <div class="hero-badges">
            @if (movie.quality) {
              <span class="badge badge--quality">{{ movie.quality }}</span>
            }
            @if (movie.lang) {
              <span class="badge badge--lang">{{ movie.lang }}</span>
            }
            @if (movie.year) {
              <span class="hero-meta">{{ movie.year }}</span>
            }
            @if (movie.time) {
              <span class="hero-dot">•</span>
              <span class="hero-meta">{{ movie.time }}</span>
            }
          </div>

          <h1 class="hero-title">{{ movie.name }}</h1>
          <p class="hero-origin">{{ movie.origin_name }}</p>

          <div class="hero-categories">
            @for (cat of movie.category; track cat.id) {
              <span class="hero-cat-tag">{{ cat.name }}</span>
            }
          </div>

          <div class="hero-actions">
            <a [routerLink]="['/phim', movie.slug]" class="btn btn--primary">
              <svg class="btn-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Xem ngay
            </a>
            <a [routerLink]="['/phim', movie.slug]" class="btn btn--secondary">
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Chi tiết
            </a>
          </div>
        </div>
      </section>
    }
  `,
})
export class HeroComponent {
  @Input() movie?: MovieListItem;
}
