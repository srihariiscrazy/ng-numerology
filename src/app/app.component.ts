
import { Component } from '@angular/core';
import { NumerologyFormComponent } from './components/numerology-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NumerologyFormComponent],
  template: `<app-numerology-form></app-numerology-form>`
})
export class AppComponent {}
