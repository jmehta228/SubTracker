import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed" role="navigation" aria-label="Main navigation">
      <!-- Logo Section -->
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="7.5 4.21 12 6.81 16.5 4.21"/>
              <polyline points="7.5 19.79 7.5 14.6 3 12"/>
              <polyline points="21 12 16.5 14.6 16.5 19.79"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          @if (!isCollapsed) {
            <span class="logo-text">SubTracker</span>
          }
        </div>
        <!-- <button
          class="collapse-btn"
          (click)="toggleCollapse()"
          [attr.aria-label]="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class.rotated]="isCollapsed">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button> -->
      </div>

      <!-- User Info -->
      @if (displayName) {
        <div class="user-info">
          <div class="user-avatar">
            {{ displayName.charAt(0).toUpperCase() }}
          </div>
          @if (!isCollapsed) {
            <div class="user-details">
              <p class="user-name">Welcome back</p>
              <p class="user-email">{{ displayName }}</p>
              @if (userEmail && displayName !== userEmail) {
                <p class="user-email-secondary">{{ userEmail }}</p>
              }
            </div>
          }
        </div>
      }

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <ul>
          <li>
            <a class="nav-item" routerLink="/dashboard" routerLinkActive="active">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="9"/>
                <rect x="14" y="3" width="7" height="5"/>
                <rect x="14" y="12" width="7" height="9"/>
                <rect x="3" y="16" width="7" height="5"/>
              </svg>
              @if (!isCollapsed) {
                <span>Dashboard</span>
              }
            </a>
          </li>
          <li>
            <a class="nav-item" routerLink="/analytics" routerLinkActive="active">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
              </svg>
              @if (!isCollapsed) {
                <span>Analytics</span>
              }
            </a>
          </li>
          <li>
            <a class="nav-item" href="javascript:void(0)" (click)="onLinkBank.emit()">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              @if (!isCollapsed) {
                <span>Link Bank</span>
              }
            </a>
          </li>
        </ul>
      </nav>

      <!-- Footer Actions -->
      <div class="sidebar-footer">
        <div class="footer-actions">
          @if (!isCollapsed) {
            <div class="theme-toggle-wrapper">
              <app-theme-toggle />
            </div>
          }
          <button class="nav-item logout-item" (click)="onLogout.emit()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            @if (!isCollapsed) {
              <span>Sign Out</span>
            }
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      background: var(--glass-bg-strong);
      backdrop-filter: var(--glass-blur-strong);
      -webkit-backdrop-filter: var(--glass-blur-strong);
      border-right: 1px solid var(--glass-border);
      z-index: var(--z-fixed);
      transition: width var(--transition-slow);
      overflow: hidden;

      &.collapsed {
        width: var(--sidebar-collapsed-width);
      }
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-5);
      border-bottom: 1px solid var(--color-gray-100);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      overflow: hidden;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-lg);
      background: var(--gradient-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .logo-text {
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      color: var(--color-text-primary);
      white-space: nowrap;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .collapse-btn {
      padding: var(--spacing-2);
      background: transparent;
      border: none;
      border-radius: var(--radius-md);
      color: var(--color-text-tertiary);
      cursor: pointer;
      transition: all var(--transition-fast);
      flex-shrink: 0;

      &:hover {
        background: var(--color-gray-100);
        color: var(--color-text-primary);
      }

      svg {
        transition: transform var(--transition-base);

        &.rotated {
          transform: rotate(180deg);
        }
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-4) var(--spacing-5);
      border-bottom: 1px solid var(--color-gray-100);
      overflow: hidden;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background: var(--gradient-accent);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-bold);
      font-size: var(--text-base);
      flex-shrink: 0;
    }

    .user-details {
      min-width: 0;
      overflow: hidden;
    }

    .user-name {
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      color: var(--color-text-tertiary);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .user-email {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--color-text-primary);
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-email-secondary {
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      color: var(--color-text-tertiary);
      margin: 2px 0 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sidebar-nav {
      flex: 1;
      padding: var(--spacing-4) var(--spacing-3);
      overflow-y: auto;

      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-1);
      }
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      border-radius: var(--radius-lg);
      color: var(--color-text-secondary);
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      text-decoration: none;
      transition: all var(--transition-fast);
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;

      svg {
        flex-shrink: 0;
      }

      span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &:hover {
        background: var(--color-gray-100);
        color: var(--color-text-primary);
      }

      &.active {
        background: var(--color-primary-light);
        color: var(--color-primary);

        svg {
          color: var(--color-primary);
        }
      }
    }

    .sidebar-footer {
      padding: var(--spacing-4) var(--spacing-3);
      border-top: 1px solid var(--color-gray-100);
    }

    .footer-actions {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .theme-toggle-wrapper {
      display: flex;
      justify-content: center;
      padding: var(--spacing-2) 0;
    }

    .logout-item {
      color: var(--color-error);

      &:hover {
        background: var(--color-error-light);
        color: var(--color-error-hover);
      }
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        box-shadow: var(--shadow-2xl);
        transition: transform var(--transition-base);
      }

      :host-context(.mobile-open) .sidebar,
      :host(.mobile-open) .sidebar {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent {
  @Input() username: string | null = null;
  @Input() userEmail: string | null = null;
  @Input() isCollapsed = false;
  @Output() onLogout = new EventEmitter<void>();
  @Output() onLinkBank = new EventEmitter<void>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  get displayName(): string | null {
    const name = typeof this.username === 'string' ? this.username.trim() : '';
    if (name) return name;
    return this.userEmail;
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }
}
