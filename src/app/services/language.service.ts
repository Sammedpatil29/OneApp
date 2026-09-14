import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import enDictionary from '../../assets/i18n/en.json';
import jawariDictionary from '../../assets/i18n/jawari.json';

export type LanguageCode = 'en' | 'jw';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  subtitle: string;
}

const STORAGE_KEY = 'pintu_language';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly languages: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'EN', subtitle: 'Standard language' },
    { code: 'jw', name: 'Jawari Kannada', nativeName: 'Jawari', subtitle: 'Regional language' }
  ];

  // Bundled dictionaries for instant zero-latency loading
  private dictionaries: Record<LanguageCode, Record<string, string>> = {
    en: enDictionary as Record<string, string>,
    jw: jawariDictionary as Record<string, string>
  };

  private currentLangSubject: BehaviorSubject<LanguageCode>;
  public currentLang$: Observable<LanguageCode>;

  // Signal for modern Angular template reactivity
  public currentLangSignal = signal<LanguageCode>('en');

  constructor(private http: HttpClient) {
    const saved = (localStorage.getItem(STORAGE_KEY) || 'en').toLowerCase();
    const initialLang: LanguageCode = (saved === 'jw' || saved === 'hi' || saved === 'kn' || saved === 'jawari') ? 'jw' : 'en';

    this.currentLangSubject = new BehaviorSubject<LanguageCode>(initialLang);
    this.currentLang$ = this.currentLangSubject.asObservable();
    this.currentLangSignal.set(initialLang);

    // Also fetch fresh json from assets/i18n if available
    this.loadJsonDictionary(initialLang);
  }

  public getLanguages(): LanguageOption[] {
    return this.languages;
  }

  public getCurrentLanguage(): LanguageCode {
    return this.currentLangSubject.value;
  }

  public setLanguage(code: string): void {
    const targetCode: LanguageCode = (code === 'jw' || code === 'hi' || code === 'kn' || code === 'jawari') ? 'jw' : 'en';

    localStorage.setItem(STORAGE_KEY, targetCode);
    this.currentLangSubject.next(targetCode);
    this.currentLangSignal.set(targetCode);

    this.loadJsonDictionary(targetCode);
  }

  private loadJsonDictionary(lang: LanguageCode): void {
    const fileName = lang === 'jw' ? 'jawari.json' : 'en.json';
    this.http.get<Record<string, string>>(`assets/i18n/${fileName}`).subscribe({
      next: (dict) => {
        if (dict && typeof dict === 'object') {
          this.dictionaries[lang] = { ...this.dictionaries[lang], ...dict };
        }
      },
      error: () => {
        // Pre-bundled dictionary in this.dictionaries[lang] is used
      }
    });
  }

  public translate(key: string, fallback?: string): string {
    if (!key) return '';
    const lang = this.currentLangSubject.value;
    const dict = this.dictionaries[lang] || this.dictionaries['en'];
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    // Fallback to English dictionary if key not yet in regional
    if (this.dictionaries['en'] && this.dictionaries['en'][key] !== undefined) {
      return this.dictionaries['en'][key];
    }
    return fallback || key;
  }

  public t(key: string, fallback?: string): string {
    return this.translate(key, fallback);
  }
}

