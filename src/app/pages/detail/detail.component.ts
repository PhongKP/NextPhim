import { Component, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../../services/movie.service';
import { MovieDetail, EpisodeServer, EpisodeLink } from '../../models/movie.model';
import { OptimizedImagePipe } from '../../pipes/optimized-image.pipe';
import { CountryNamesPipe } from '../../pipes/country-names.pipe';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [RouterLink, OptimizedImagePipe, CountryNamesPipe, SkeletonComponent],
  styleUrl: './detail.component.scss',
  template: `
    @if (loading()) {
      <div class="detail-loading">
        <app-skeleton variant="detail" />
      </div>
    } @else if (movie()) {
      <!-- Backdrop -->
      <div class="detail-backdrop">
        <img [src]="movie()!.poster_url | optimizedImage:'poster'"
             [alt]="movie()!.name"
             class="detail-backdrop-img" />
        <div class="detail-backdrop-gradient-top"></div>
        <div class="detail-backdrop-gradient-side"></div>
      </div>

      <!-- Content -->
      <div class="detail-content">
        <div class="detail-layout">
          <!-- Poster -->
          <div class="detail-poster">
            <img [src]="movie()!.thumb_url | optimizedImage"
                 [alt]="movie()!.name"
                 class="detail-poster-img" />
          </div>

          <!-- Info -->
          <div class="detail-info">
            <h1 class="detail-title">{{ movie()!.name }}</h1>
            <p class="detail-origin-name">{{ movie()!.origin_name }}</p>

            <!-- Meta Badges -->
            <div class="detail-meta-badges">
              @if (movie()!.quality) {
                <span class="meta-badge meta-badge--accent">{{ movie()!.quality }}</span>
              }
              @if (movie()!.lang) {
                <span class="meta-badge meta-badge--blue">{{ movie()!.lang }}</span>
              }
              @if (movie()!.year) {
                <span class="meta-badge meta-badge--neutral">{{ movie()!.year }}</span>
              }
              @if (movie()!.time) {
                <span class="meta-badge meta-badge--neutral">⏱ {{ movie()!.time }}</span>
              }
              @if (movie()!.episode_current) {
                <span class="meta-badge meta-badge--green">{{ movie()!.episode_current }}</span>
              }
            </div>

            <!-- Categories -->
            <div class="detail-categories">
              @for (cat of movie()!.category; track cat.id) {
                <a [routerLink]="['/the-loai', cat.slug]" class="detail-cat-link">{{ cat.name }}</a>
              }
            </div>

            <!-- Director & Actors -->
            <div class="detail-credits">
              @if (movie()!.director.length && movie()!.director[0]) {
                <p class="detail-credit-row">
                  <span class="credit-label">Đạo diễn: </span>
                  <span class="credit-value">{{ movie()!.director.join(', ') }}</span>
                </p>
              }
              @if (movie()!.actor.length && movie()!.actor[0]) {
                <p class="detail-credit-row">
                  <span class="credit-label">Diễn viên: </span>
                  <span class="credit-value">{{ movie()!.actor.join(', ') }}</span>
                </p>
              }
              @if (movie()!.country.length) {
                <p class="detail-credit-row">
                  <span class="credit-label">Quốc gia: </span>
                  <span class="credit-value">{{ movie()!.country | countryNames }}</span>
                </p>
              }
            </div>

            <!-- Description -->
            <div class="detail-desc" [innerHTML]="movie()!.content"></div>

            <!-- Play Button -->
            @if (episodes().length) {
              <div class="detail-play-section">
                <button (click)="playFirstEpisode()" class="btn-play">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Xem Phim
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Video Player -->
        @if (currentEpisodeUrl()) {
          <section class="player-section">
            <h2 class="player-heading">🎬 Đang phát: {{ currentEpisodeName() }}</h2>
            <div class="player-wrapper">
              <iframe [src]="currentEpisodeUrl()!"
                      class="player-iframe"
                      allowfullscreen
                      allow="autoplay; encrypted-media; picture-in-picture">
              </iframe>
            </div>
          </section>
        }

        <!-- Episode Selector -->
        @if (episodes().length) {
          <section class="episodes-section">
            <h2 class="player-heading">📋 Danh sách tập</h2>

            @if (episodes().length > 1) {
              <div class="server-tabs">
                @for (server of episodes(); track server.server_name; let i = $index) {
                  <button (click)="activeServer.set(i)"
                          class="server-tab"
                          [class.server-tab--active]="activeServer() === i"
                          [class.server-tab--inactive]="activeServer() !== i">
                    {{ server.server_name }}
                  </button>
                }
              </div>
            }

            <div class="episode-grid">
              @for (ep of currentServerEpisodes(); track ep.slug) {
                <button (click)="playEpisode(ep)"
                        class="episode-btn"
                        [class.episode-btn--active]="selectedEpisode()?.slug === ep.slug"
                        [class.episode-btn--inactive]="selectedEpisode()?.slug !== ep.slug">
                  {{ ep.name }}
                </button>
              }
            </div>
          </section>
        }
      </div>
    }
  `,
})
export class DetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly movieService = inject(MovieService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroy$ = new Subject<void>();

  loading = signal(true);
  movie = signal<MovieDetail | undefined>(undefined);
  episodes = signal<EpisodeServer[]>([]);
  activeServer = signal(0);
  selectedEpisode = signal<EpisodeLink | undefined>(undefined);
  currentEpisodeName = signal('');
  currentEpisodeUrl = signal<SafeResourceUrl | undefined>(undefined);

  currentServerEpisodes = computed(() => {
    const eps = this.episodes();
    const idx = this.activeServer();
    return eps[idx]?.server_data ?? [];
  });

  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.loading.set(true);
          this.currentEpisodeUrl.set(undefined);
          this.selectedEpisode.set(undefined);
          window.scrollTo({ top: 0 });
          return this.movieService.getMovieDetail(params['slug']);
        })
      )
      .subscribe({
        next: (res) => {
          this.movie.set(res.movie);
          this.episodes.set(res.episodes ?? []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  playFirstEpisode(): void {
    const eps = this.currentServerEpisodes();
    if (eps.length) {
      this.playEpisode(eps[0]);
    }
  }

  playEpisode(ep: EpisodeLink): void {
    this.selectedEpisode.set(ep);
    this.currentEpisodeName.set(ep.name);
    const url = ep.link_embed || ep.link_m3u8;
    this.currentEpisodeUrl.set(
      url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : undefined
    );

    // Scroll to player
    setTimeout(() => {
      document.querySelector('iframe')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}
