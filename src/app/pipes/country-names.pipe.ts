import { Pipe, PipeTransform } from '@angular/core';
import { CountryRef } from '../models/movie.model';

@Pipe({ name: 'countryNames', standalone: true })
export class CountryNamesPipe implements PipeTransform {
  transform(countries: CountryRef[] | undefined): string {
    if (!countries?.length) return '';
    return countries.map((c) => c.name).join(', ');
  }
}
