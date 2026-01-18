import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="stats-card" [class]="'stats-card-' + variant">
      <div class="stats-icon">
        <ng-content select="[icon]"></ng-content>
      </div>
      <div class="stats-content">
        <p class="stats-label">{{ label }}</p>
        <p class="stats-value">{{ value }}</p>
        @if (subtext) {
          <p class="stats-subtext">{{ subtext }}</p>
        }
      </div>
      @if (trend) {
        <div class="stats-trend" [class.trend-up]="trendDirection === 'up'" [class.trend-down]="trendDirection === 'down'">
          @if (trendDirection === 'up') {
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
              <polyline points="17 18 23 18 23 12"/>
            </svg>
          }
          <span>{{ trend }}</span>
        </div>
      }
    </article>
  `,
  styles: [`
    .stats-card {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-4);
      padding: var(--spacing-5);
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-base);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        opacity: 0;
        transition: opacity var(--transition-fast);
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);

        &::before {
          opacity: 1;
        }
      }
    }

    .stats-card-primary::before { background: var(--gradient-primary); }
    .stats-card-secondary::before { background: var(--gradient-secondary); }
    .stats-card-accent::before { background: var(--gradient-accent); }
    .stats-card-warning::before { background: var(--gradient-warning); }

    .stats-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      svg {
        width: 24px;
        height: 24px;
      }
    }

    .stats-card-primary .stats-icon {
      background: var(--color-primary-light);
      color: var(--color-primary);
    }

    .stats-card-secondary .stats-icon {
      background: var(--color-secondary-light);
      color: var(--color-secondary);
    }

    .stats-card-accent .stats-icon {
      background: var(--color-accent-light);
      color: var(--color-accent);
    }

    .stats-card-warning .stats-icon {
      background: var(--color-warning-light);
      color: var(--color-warning);
    }

    .stats-content {
      flex: 1;
      min-width: 0;
    }

    .stats-label {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--color-text-secondary);
      margin: 0 0 var(--spacing-1);
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .stats-value {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      margin: 0;
      line-height: var(--leading-tight);
    }

    .stats-subtext {
      font-size: var(--text-xs);
      color: var(--color-text-tertiary);
      margin: var(--spacing-1) 0 0;
    }

    .stats-trend {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      font-size: var(--text-xs);
      font-weight: var(--font-semibold);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radius-full);
    }

    .trend-up {
      background: var(--color-success-light);
      color: var(--color-success);
    }

    .trend-down {
      background: var(--color-error-light);
      color: var(--color-error);
    }

    @media (max-width: 480px) {
      .stats-card {
        padding: var(--spacing-4);
      }

      .stats-icon {
        width: 40px;
        height: 40px;

        svg {
          width: 20px;
          height: 20px;
        }
      }

      .stats-value {
        font-size: var(--text-xl);
      }
    }
  `]
})
export class StatsCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() subtext?: string;
  @Input() variant: 'primary' | 'secondary' | 'accent' | 'warning' = 'primary';
  @Input() trend?: string;
  @Input() trendDirection?: 'up' | 'down';
}
