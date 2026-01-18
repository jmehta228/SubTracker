import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div
          class="modal"
          role="dialog"
          [attr.aria-labelledby]="titleId"
          aria-modal="true"
        >
          <div class="modal-header">
            <h3 [id]="titleId">{{ title }}</h3>
            <button
              class="modal-close"
              (click)="close.emit()"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          @if (showFooter) {
            <div class="modal-footer">
              <ng-content select="[modal-footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-4);
      z-index: var(--z-modal-backdrop);
      animation: fadeIn 0.2s var(--ease-out);
    }

    .modal {
      background: var(--color-surface);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-2xl);
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: scaleIn 0.2s var(--ease-out);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-5) var(--spacing-6);
      border-bottom: 1px solid var(--color-gray-100);

      h3 {
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
        color: var(--color-text-primary);
        margin: 0;
      }
    }

    .modal-close {
      padding: var(--spacing-2);
      background: transparent;
      border: none;
      border-radius: var(--radius-md);
      color: var(--color-text-tertiary);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--color-gray-100);
        color: var(--color-text-primary);
      }
    }

    .modal-body {
      padding: var(--spacing-6);
      overflow-y: auto;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--spacing-3);
      padding: var(--spacing-4) var(--spacing-6);
      border-top: 1px solid var(--color-gray-100);
      background: var(--color-gray-50);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() showFooter = true;
  @Output() close = new EventEmitter<void>();

  titleId = 'modal-title-' + Math.random().toString(36).substring(2, 9);

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
