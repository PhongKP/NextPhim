import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './footer.component.scss',
  template: `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-grid">
          <!-- Brand -->
          <div>
            <a routerLink="/" class="footer-brand-link">
              <span class="footer-logo">
                <span class="accent">NEXT</span><span class="white">PHIM</span>
              </span>
            </a>
            <p class="footer-desc">
              Xem phim online miễn phí chất lượng cao. Phim mới cập nhật mỗi ngày với nhiều thể loại phong phú.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="footer-heading">Danh mục</h4>
            <ul class="footer-list">
              <li><a routerLink="/danh-sach/phim-bo" class="footer-link">Phim Bộ</a></li>
              <li><a routerLink="/danh-sach/phim-le" class="footer-link">Phim Lẻ</a></li>
              <li><a routerLink="/danh-sach/hoat-hinh" class="footer-link">Hoạt Hình</a></li>
              <li><a routerLink="/danh-sach/tv-shows" class="footer-link">TV Shows</a></li>
            </ul>
          </div>

          <!-- Genres -->
          <div>
            <h4 class="footer-heading">Thể loại</h4>
            <ul class="footer-list">
              <li><a routerLink="/the-loai/hanh-dong" class="footer-link">Hành Động</a></li>
              <li><a routerLink="/the-loai/tinh-cam" class="footer-link">Tình Cảm</a></li>
              <li><a routerLink="/the-loai/kinh-di" class="footer-link">Kinh Dị</a></li>
              <li><a routerLink="/the-loai/hai-huoc" class="footer-link">Hài Hước</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-copyright">
            © 2026 NextPhim. Dữ liệu phim được cung cấp bởi KKPhim API.
          </p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
