import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="empty-state-icon">
        <ng-content select="[icon]"></ng-content>
        @if (!hasIconContent) {
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.29 7 12 12 20.71 7"/>
            <line x1="12" y1="22" x2="12" y2="12"/>
          </svg>
        }
      </div>
      <h3 class="empty-state-title">{{ title }}</h3>
      @if (description) {
        <p class="empty-state-description">{{ description }}</p>
      }
      @if (actionText) {
        <button class="btn btn-primary" (click)="action.emit()">
          {{ actionText }}
        </button>
      }
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--spacing-12) var(--spacing-6);
      background: var(--glass-bg-subtle);
      backdrop-filter: var(--glass-blur-subtle);
      border: 1px dashed var(--color-gray-200);
      border-radius: var(--radius-2xl);
      animation: fadeInUp 0.4s var(--ease-out);
    }

    .empty-state-icon {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--color-primary-lighter) 0%, var(--color-accent-light) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--spacing-5);
      color: var(--color-primary);

      svg {
        opacity: 0.8;
      }
    }

    .empty-state-title {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-2);
    }

    .empty-state-description {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      max-width: 320px;
      margin: 0 0 var(--spacing-5);
      line-height: var(--leading-relaxed);
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'No items found';
  @Input() description?: string;
  @Input() actionText?: string;
  @Output() action = new EventEmitter<void>();

  hasIconContent = false;
}
