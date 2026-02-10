import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'phim/:slug',
    loadComponent: () =>
      import('./pages/detail/detail.component').then((m) => m.DetailComponent),
  },
  {
    path: 'tim-kiem',
    loadComponent: () =>
      import('./pages/search/search.component').then((m) => m.SearchComponent),
  },
  {
    path: 'danh-sach/:slug',
    loadComponent: () =>
      import('./pages/category-list/category-list.component').then(
        (m) => m.CategoryListComponent
      ),
  },
  {
    path: 'the-loai/:slug',
    loadComponent: () =>
      import('./pages/category-list/category-list.component').then(
        (m) => m.CategoryListComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
