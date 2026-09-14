import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey = '';
  private lastFallback?: string;
  private lastValue = '';
  private sub?: Subscription;

  constructor(
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {
    this.sub = this.languageService.currentLang$.subscribe(() => {
      if (this.lastKey) {
        this.lastValue = this.languageService.translate(this.lastKey, this.lastFallback);
        this.cdr.markForCheck();
      }
    });
  }

  transform(key: string, fallback?: string): string {
    if (!key) return '';
    this.lastKey = key;
    this.lastFallback = fallback;
    this.lastValue = this.languageService.translate(key, fallback);
    return this.lastValue;
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}

