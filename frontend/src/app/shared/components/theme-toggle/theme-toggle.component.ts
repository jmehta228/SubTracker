import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="theme-toggle"
      (click)="toggleTheme()"
      [attr.aria-label]="'Switch to ' + (isDark() ? 'light' : 'dark') + ' mode'"
      title="{{ isDark() ? 'Switch to light mode' : 'Switch to dark mode' }}"
    >
      <div class="toggle-track">
        <div class="toggle-thumb" [class.dark]="isDark()">
          <!-- Sun icon -->
          <svg
            *ngIf="!isDark()"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <!-- Moon icon -->
          <svg
            *ngIf="isDark()"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </div>
      </div>
    </button>
  `,
  styles: [`
    .theme-toggle {
      padding: 0;
      background: transparent;
      border: none;
      cursor: pointer;
      outline: none;

      &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
        border-radius: var(--radius-full);
      }
    }

    .toggle-track {
      width: 48px;
      height: 26px;
      background: var(--color-gray-200);
      border-radius: var(--radius-full);
      padding: 3px;
      position: relative;
      transition: background-color var(--transition-base);

      &:hover {
        background: var(--color-gray-300);
      }
    }

    .toggle-thumb {
      width: 20px;
      height: 20px;
      background: white;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #f59e0b;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-base);
      transform: translateX(0);

      &.dark {
        transform: translateX(22px);
        background: var(--color-gray-800);
        color: #fbbf24;
      }

      svg {
        flex-shrink: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .toggle-track,
      .toggle-thumb {
        transition: none;
      }
    }
  `]
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);

  isDark(): boolean {
    return this.themeService.currentTheme() === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
