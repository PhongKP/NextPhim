import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  styleUrl: './skeleton.component.scss',
  template: `
    <div>
      @switch (variant) {
        @case ('card') {
          <div class="skel-card-img"></div>
          <div class="skel-card-title"></div>
          <div class="skel-card-sub"></div>
        }
        @case ('hero') {
          <div class="skel-hero"></div>
        }
        @case ('detail') {
          <div class="skel-detail">
            <div class="skel-detail-poster"></div>
            <div class="skel-detail-info">
              <div class="skel-line skel-line--lg"></div>
              <div class="skel-line skel-line--md"></div>
              <div class="skel-line skel-line--full"></div>
              <div class="skel-line skel-line--full"></div>
              <div class="skel-line skel-line--sm"></div>
              <div class="skel-buttons">
                <div class="skel-btn"></div>
                <div class="skel-btn"></div>
              </div>
            </div>
          </div>
        }
        @case ('rail') {
          <div class="skel-rail-title"></div>
          <div class="skel-rail-cards">
            @for (i of skeletonCards; track i) {
              <div class="skel-rail-card">
                <div class="skel-card-img"></div>
                <div class="skel-card-title"></div>
              </div>
            }
          </div>
        }
        @default {
          <div class="skeleton-block" style="height:16px;width:100%"></div>
        }
      }
    </div>
  `,
})
export class SkeletonComponent {
  @Input() variant: 'card' | 'hero' | 'detail' | 'rail' | 'text' = 'card';
  @Input() count = 6;

  get skeletonCards(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
