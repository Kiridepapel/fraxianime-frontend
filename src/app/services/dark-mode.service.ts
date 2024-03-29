import { Injectable } from '@angular/core';
import { Mode } from '../models/individual.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  private darkMode: boolean = true;
  private darkModeSubject = new BehaviorSubject<Mode>({
    value: this.darkMode,
    icon: this.darkMode ? 'fa-regular fa-sun' : 'fa-solid fa-moon',
    styles: this.darkMode ? 'text-[24px]' : 'text-[28px]',
  });

  public initDarkMode() {
    if (!localStorage.getItem('dark')) {
      localStorage.setItem('dark', this.darkMode.toString());
    }

    this.darkMode = localStorage.getItem('dark') === 'true';
    this.saveNext();
    this.saveLocalStorage();
  }

  public get darkMode$() {
    return this.darkModeSubject.asObservable();
  }

  public toggleDarkMode() {
    this.darkMode = !this.darkMode;
    this.saveNext();
    this.saveLocalStorage();
  }

  private saveNext(): void {
    this.darkModeSubject.next({
      value: this.darkMode,
      icon: this.darkMode ? 'fa-regular fa-sun' : 'fa-solid fa-moon',
      styles: this.darkMode ? 'text-[24px]' : 'text-[28px]',
    });
  }

  private saveLocalStorage() {
    document.documentElement.classList.toggle('dark', this.darkMode);
    localStorage.setItem('dark', this.darkMode.toString());
  }
}
