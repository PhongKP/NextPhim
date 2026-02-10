import { Component, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieListItem } from '../../models/movie.model';
import { MovieCardComponent } from '../movie-card/movie-card.component';

@Component({
  selector: 'app-movie-rail',
  standalone: true,
  imports: [RouterLink, MovieCardComponent],
  styleUrl: './movie-rail.component.scss',
  template: `
    <section class="rail-section">
      <div class="rail-header">
        <div class="rail-title-group">
          <div class="rail-accent-bar"></div>
          <h2 class="rail-title">{{ title }}</h2>
        </div>
        @if (viewAllLink) {
          <a [routerLink]="viewAllLink" class="view-all-link">
            Xem tất cả
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </a>
        }
      </div>

      <div class="rail-scroll-wrapper">
        <button (click)="scrollLeft()" class="scroll-arrow scroll-arrow--left">
          <div class="arrow-circle">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
            </svg>
          </div>
        </button>

        <div #railContainer class="rail-container">
          @for (movie of movies; track movie._id) {
            <app-movie-card [movie]="movie" class="rail-card" />
          }
        </div>

        <button (click)="scrollRight()" class="scroll-arrow scroll-arrow--right">
          <div class="arrow-circle">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </button>
      </div>
    </section>
  `,
})
export class MovieRailComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) movies!: MovieListItem[];
  @Input() viewAllLink?: string;

  @ViewChild('railContainer') railContainer!: ElementRef<HTMLDivElement>;

  scrollLeft(): void {
    this.railContainer.nativeElement.scrollBy({ left: -600, behavior: 'smooth' });
  }

  scrollRight(): void {
    this.railContainer.nativeElement.scrollBy({ left: 600, behavior: 'smooth' });
  }
}
