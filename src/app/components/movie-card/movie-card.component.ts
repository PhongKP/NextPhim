import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieListItem } from '../../models/movie.model';
import { OptimizedImagePipe } from '../../pipes/optimized-image.pipe';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, OptimizedImagePipe],
  styleUrl: './movie-card.component.scss',
  template: `
    <a [routerLink]="['/phim', movie.slug]" class="card-link">
      <div class="card-thumb">
        <img [src]="movie.thumb_url | optimizedImage"
             [alt]="movie.name"
             loading="lazy"
             class="card-img" />

        <div class="card-gradient"></div>

        <div class="card-overlay">
          <div class="play-circle">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        <div class="badges-left">
          @if (movie.quality) {
            <span class="badge badge--quality">{{ movie.quality }}</span>
          }
          @if (movie.lang) {
            <span class="badge badge--lang">{{ movie.lang }}</span>
          }
        </div>

        @if (movie.episode_current) {
          <span class="badge-episode">{{ movie.episode_current }}</span>
        }
      </div>

      <h3 class="card-title">{{ movie.name }}</h3>
      <p class="card-sub">{{ movie.origin_name }} · {{ movie.year }}</p>
    </a>
  `,
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: MovieListItem;
}
