import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen" [title]="title" (close)="cancel.emit()">
      <div class="confirm-content">
        <div class="confirm-icon" [class]="'confirm-icon-' + variant">
          @switch (variant) {
            @case ('danger') {
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            }
            @case ('warning') {
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            }
            @default {
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            }
          }
        </div>
        <p class="confirm-message">{{ message }}</p>
      </div>
      <div modal-footer>
        <button class="btn btn-ghost" (click)="cancel.emit()">
          {{ cancelText }}
        </button>
        <button
          [class]="'btn ' + (variant === 'danger' ? 'btn-danger' : 'btn-primary')"
          (click)="confirm.emit()"
        >
          {{ confirmText }}
        </button>
      </div>
    </app-modal>
  `,
  styles: [`
    .confirm-content {
      text-align: center;
      padding: var(--spacing-4) 0;
    }

    .confirm-icon {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--spacing-4);

      svg {
        width: 28px;
        height: 28px;
      }
    }

    .confirm-icon-danger {
      background: var(--color-error-light);
      color: var(--color-error);
    }

    .confirm-icon-warning {
      background: var(--color-warning-light);
      color: var(--color-warning);
    }

    .confirm-icon-info {
      background: var(--color-primary-light);
      color: var(--color-primary);
    }

    .confirm-message {
      font-size: var(--text-base);
      color: var(--color-text-secondary);
      line-height: var(--leading-relaxed);
      margin: 0;
    }
  `]
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() variant: 'danger' | 'warning' | 'info' = 'info';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
