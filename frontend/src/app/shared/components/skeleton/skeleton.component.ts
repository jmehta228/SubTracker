import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton"
      [class.skeleton-circle]="variant === 'circle'"
      [class.skeleton-card]="variant === 'card'"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="variant === 'circle' ? '50%' : undefined"
    ></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--color-gray-100) 0%,
        var(--color-gray-200) 50%,
        var(--color-gray-100) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite linear;
      border-radius: var(--radius-md);
    }

    .skeleton-card {
      border-radius: var(--radius-xl);
      min-height: 120px;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '1rem';
  @Input() variant: 'text' | 'circle' | 'card' = 'text';
}
