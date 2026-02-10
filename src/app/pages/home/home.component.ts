import { Component, signal, inject, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MovieService } from '../../services/movie.service';
import { MovieListItem } from '../../models/movie.model';
import { HeroComponent } from '../../components/hero/hero.component';
import { MovieRailComponent } from '../../components/movie-rail/movie-rail.component';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, MovieRailComponent, SkeletonComponent],
  styleUrl: './home.component.scss',
  template: `
    @if (loading()) {
      <app-skeleton variant="hero" />
    } @else if (featuredMovie()) {
      <app-hero [movie]="featuredMovie()!" />
    }

    <div class="home-rails">
      @if (loading()) {
        <div class="skeleton-rails">
          @for (i of [1,2,3,4]; track i) {
            <app-skeleton variant="rail" [count]="8" />
          }
        </div>
      } @else {
        @if (latestMovies().length) {
          <app-movie-rail title="🔥 Phim Mới Cập Nhật" [movies]="latestMovies()" />
        }
        @if (seriesMovies().length) {
          <app-movie-rail title="📺 Phim Bộ Mới" [movies]="seriesMovies()" viewAllLink="/danh-sach/phim-bo" />
        }
        @if (singleMovies().length) {
          <app-movie-rail title="🎬 Phim Lẻ Hay" [movies]="singleMovies()" viewAllLink="/danh-sach/phim-le" />
        }
        @if (animationMovies().length) {
          <app-movie-rail title="✨ Hoạt Hình" [movies]="animationMovies()" viewAllLink="/danh-sach/hoat-hinh" />
        }
      }
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private readonly movieService = inject(MovieService);

  loading = signal(true);
  featuredMovie = signal<MovieListItem | undefined>(undefined);
  latestMovies = signal<MovieListItem[]>([]);
  seriesMovies = signal<MovieListItem[]>([]);
  singleMovies = signal<MovieListItem[]>([]);
  animationMovies = signal<MovieListItem[]>([]);

  ngOnInit(): void {
    forkJoin({
      latest: this.movieService.getLatestMovies(),
      series: this.movieService.getSeriesList(),
      single: this.movieService.getSingleMovies(),
      animation: this.movieService.getAnimationList(),
    }).subscribe({
      next: ({ latest, series, single, animation }) => {
        const latestItems = latest.items ?? [];
        this.latestMovies.set(latestItems);

        // Pick a random featured movie from the first 5
        if (latestItems.length > 0) {
          const idx = Math.floor(Math.random() * Math.min(5, latestItems.length));
          this.featuredMovie.set(latestItems[idx]);
        }

        this.seriesMovies.set(series.data?.items ?? []);
        this.singleMovies.set(single.data?.items ?? []);
        this.animationMovies.set(animation.data?.items ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
