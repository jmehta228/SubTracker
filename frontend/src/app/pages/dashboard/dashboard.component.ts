import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionCardComponent } from '../../components/subscription-card/subscription-card.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from '../../shared/services/toast.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SubscriptionCardComponent,
    SidebarComponent,
    StatsCardComponent,
    ToastComponent,
    SkeletonComponent,
    EmptyStateComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  subscriptions: any[] = [];
  name = '';
  amount = 0;
  frequency = 'monthly';
  dueDate = '';
  userEmail: string | null = null;
  username: string | null = null;

  // UI State
  sidebarCollapsed = false;
  showAddForm = false;
  isLoading = true;
  isSubmitting = false;
  mobileMenuOpen = false;

  // Edit modal state
  showEditModal = false;
  editingSubscription: any = null;
  editName = '';
  editAmount = 0;
  editFrequency = 'monthly';
  editDueDate = '';
  isUpdating = false;

  // Computed stats
  monthlyTotal = 0;
  yearlyTotal = 0;
  upcomingCount = 0;

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router,
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
    this.userEmail = this.normalizeStoredUserEmail(localStorage.getItem('userEmail'));
    this.username = this.normalizeStoredUsername(localStorage.getItem('username'));
  }

  loadSubscriptions(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.isLoading = false;
      return;
    }

    this.subscriptionService.getSubscriptions(userId).subscribe({
      next: (subs) => {
        this.subscriptions = subs.sort((a, b) => this.getDueDateSortKey(a.dueDate) - this.getDueDateSortKey(b.dueDate));
        this.calculateStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load subscriptions', err);
        this.toastService.error('Failed to load subscriptions', 'Please try refreshing the page');
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    this.monthlyTotal = 0;
    this.yearlyTotal = 0;
    this.upcomingCount = 0;

    this.subscriptions.forEach(sub => {
      const amount = sub.amount || 0;

      if (sub.frequency === 'monthly') {
        this.monthlyTotal += amount;
        this.yearlyTotal += amount * 12;
      } else if (sub.frequency === 'yearly') {
        this.monthlyTotal += amount / 12;
        this.yearlyTotal += amount;
      }

      // Count upcoming renewals (within 7 days)
      const dueDate = new Date(sub.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate >= today && dueDate <= weekFromNow) {
        this.upcomingCount++;
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      // Reset form when opening
      this.name = '';
      this.amount = 0;
      this.frequency = 'monthly';
      this.dueDate = '';
    }
  }

  addSubscription(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    if (!this.name || !this.amount || !this.dueDate) {
      this.toastService.warning('Please fill in all fields');
      return;
    }

    this.isSubmitting = true;

    const newSub = {
      name: this.name,
      amount: this.amount,
      frequency: this.frequency,
      dueDate: this.dueDate
    };

    this.subscriptionService.addSubscription(userId, newSub).subscribe({
      next: (sub) => {
        this.subscriptions.push(sub);
        this.subscriptions.sort((a, b) => this.getDueDateSortKey(a.dueDate) - this.getDueDateSortKey(b.dueDate));
        this.calculateStats();

        // Reset form
        this.name = '';
        this.amount = 0;
        this.frequency = 'monthly';
        this.dueDate = '';
        this.showAddForm = false;
        this.isSubmitting = false;

        this.toastService.success('Subscription added', `${sub.name} has been added successfully`);
      },
      error: () => {
        this.toastService.error('Failed to add subscription', 'Please try again');
        this.isSubmitting = false;
      }
    });
  }

  handleDelete(id: string): void {
    const subscription = this.subscriptions.find(s => s._id === id);
    const subName = subscription?.name || 'Subscription';

    this.subscriptionService.deleteSubscription(id).subscribe({
      next: () => {
        this.subscriptions = this.subscriptions.filter(s => s._id !== id);
        this.calculateStats();
        this.toastService.success('Subscription deleted', `${subName} has been removed`);
      },
      error: (err) => {
        console.error('Failed to delete subscription', err);
        this.toastService.error('Failed to delete subscription', 'Please try again');
      }
    });
  }

  handlePaid(id: string): void {
    const subscription = this.subscriptions.find(s => s._id === id);
    if (!subscription) return;

    if (!this.canMarkPaid(subscription.dueDate, subscription.frequency)) {
      const payWindowDays = this.getPaidWindowDays(subscription.frequency);
      this.toastService.warning(
        'Too early to mark as paid',
        `You can only mark paid when it's due within ${payWindowDays} days (or overdue)`
      );
      return;
    }

    const previousDueDate = subscription.dueDate;
    const nextDueDate = this.calculateNextDueDate(subscription.dueDate, subscription.frequency);
    if (!nextDueDate) return;

    subscription.dueDate = nextDueDate;
    this.subscriptions.sort((a, b) => this.getDueDateSortKey(a.dueDate) - this.getDueDateSortKey(b.dueDate));
    this.calculateStats();

    this.subscriptionService.updateSubscription(id, { dueDate: nextDueDate }).subscribe({
      next: (updated) => {
        subscription.dueDate = updated?.dueDate ?? nextDueDate;
        this.subscriptions.sort((a, b) => this.getDueDateSortKey(a.dueDate) - this.getDueDateSortKey(b.dueDate));
        this.calculateStats();
        this.toastService.success('Marked as paid', `${subscription.name} due date updated`);
      },
      error: (err) => {
        console.error('Failed to update subscription', err);
        subscription.dueDate = previousDueDate;
        this.subscriptions.sort((a, b) => this.getDueDateSortKey(a.dueDate) - this.getDueDateSortKey(b.dueDate));
        this.calculateStats();
        this.toastService.error('Failed to mark as paid', 'Please try again');
      }
    });
  }

  handleEdit(id: string): void {
    const subscription = this.subscriptions.find(s => s._id === id);
    if (!subscription) return;

    this.editingSubscription = subscription;
    this.editName = subscription.name;
    this.editAmount = subscription.amount;
    this.editFrequency = subscription.frequency;
    this.editDueDate = this.formatDateForInput(new Date(subscription.dueDate));
    this.showEditModal = true;
  }

  saveEdit(): void {
    if (!this.editingSubscription) return;

    if (!this.editName || !this.editAmount || !this.editDueDate) {
      this.toastService.warning('Please fill in all fields');
      return;
    }

    this.isUpdating = true;

    const updatedSub = {
      name: this.editName,
      amount: this.editAmount,
      frequency: this.editFrequency,
      dueDate: this.editDueDate
    };

    this.subscriptionService.updateSubscription(this.editingSubscription._id, updatedSub).subscribe({
      next: (updated) => {
        const index = this.subscriptions.findIndex(s => s._id === this.editingSubscription._id);
        if (index !== -1) {
          this.subscriptions[index] = { ...this.subscriptions[index], ...updatedSub, ...updated };
          this.subscriptions.sort((a, b) => this.getDueDateSortKey(a.dueDate) - this.getDueDateSortKey(b.dueDate));
          this.calculateStats();
        }
        this.closeEditModal();
        this.toastService.success('Subscription updated', `${this.editName} has been updated successfully`);
      },
      error: (err) => {
        console.error('Failed to update subscription', err);
        this.toastService.error('Failed to update subscription', 'Please try again');
        this.isUpdating = false;
      }
    });
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingSubscription = null;
    this.editName = '';
    this.editAmount = 0;
    this.editFrequency = 'monthly';
    this.editDueDate = '';
    this.isUpdating = false;
  }

  onLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  openPlaid(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastService.error('Error', 'Please log in again');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    this.http.post<{ link_token: string }>(
      'http://localhost:4000/api/plaid/link-token',
      {},
      { headers }
    ).subscribe({
      next: (res) => {
        const handler = (window as any).Plaid.create({
          token: res.link_token,
          onSuccess: (public_token: string) => {
            this.exchangeToken(public_token);
          },
          onExit: (err: any, metadata: any) => {
            if (err) {
              console.error('Plaid Link exited with error', err);
              this.toastService.error('Bank connection cancelled', err.display_message || 'Please try again');
            }
          },
        });
        handler.open();
      },
      error: (err) => {
        console.error('Failed to get Plaid link token', err);
        this.toastService.error('Failed to initialize bank connection', 'Please try again later');
      }
    });
  }

  private exchangeToken(publicToken: string): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.post<{ success: boolean; message: string }>(
      'http://localhost:4000/api/plaid/exchange-token',
      { public_token: publicToken },
      { headers }
    ).subscribe({
      next: (res) => {
        this.toastService.success('Bank account linked!', 'Analyzing transactions for subscriptions...');
        this.fetchRecurringTransactions();
      },
      error: (err) => {
        console.error('Token exchange error:', err);
        this.toastService.error('Failed to link bank account', 'Please try again');
      },
    });
  }

  fetchRecurringTransactions(): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<{ recurring: any[]; analyzed: number }>(
      'http://localhost:4000/api/plaid/recurring',
      { headers }
    ).subscribe({
      next: (res) => {
        if (res.recurring.length > 0) {
          this.toastService.success(
            `Found ${res.recurring.length} subscriptions`,
            'Review detected subscriptions below'
          );
          // You could show a modal here to let user import detected subscriptions
          console.log('Detected recurring transactions:', res.recurring);
        } else {
          this.toastService.info('No subscriptions detected', 'We analyzed your transactions but found no recurring charges');
        }
      },
      error: (err) => {
        console.error('Failed to fetch recurring transactions', err);
      }
    });
  }

  private normalizeStoredUserEmail(value: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
    return trimmed;
  }

  private normalizeStoredUsername(value: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
    return trimmed;
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private parseLocalDate(value: string | Date): Date | null {
    if (!value) return null;
    if (value instanceof Date) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    const datePart = value.slice(0, 10);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
    if (match) {
      const year = Number(match[1]);
      const monthIndex = Number(match[2]) - 1;
      const day = Number(match[3]);
      return new Date(year, monthIndex, day);
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  private getDueDateSortKey(value: string | Date): number {
    const parsed = this.parseLocalDate(value);
    return parsed ? parsed.getTime() : Number.POSITIVE_INFINITY;
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private canMarkPaid(dueDate: string | Date, frequency: string): boolean {
    const due = this.parseLocalDate(dueDate);
    if (!due) return false;

    const today = this.startOfDay(new Date());
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= this.getPaidWindowDays(frequency);
  }

  private calculateNextDueDate(dueDate: string | Date, frequency: string): string | null {
    const due = this.parseLocalDate(dueDate);
    if (!due) return null;

    const today = this.startOfDay(new Date());
    const payWindowDays = this.getPaidWindowDays(frequency);
    let next = this.addBillingPeriod(due, frequency, 1);
    while (Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) <= payWindowDays) {
      next = this.addBillingPeriod(next, frequency, 1);
    }
    return this.formatDateForInput(next);
  }

  private getPaidWindowDays(frequency: string): number {
    return frequency === 'yearly' ? 30 : 7;
  }

  private addBillingPeriod(date: Date, frequency: string, count: number): Date {
    switch (frequency) {
      case 'yearly':
        return this.addYearsClamped(date, count);
      case 'monthly':
      default:
        return this.addMonthsClamped(date, count);
    }
  }

  private addMonthsClamped(date: Date, months: number): Date {
    const originalDay = date.getDate();
    const firstOfTarget = new Date(date.getFullYear(), date.getMonth() + months, 1);
    const daysInTargetMonth = new Date(
      firstOfTarget.getFullYear(),
      firstOfTarget.getMonth() + 1,
      0
    ).getDate();
    const day = Math.min(originalDay, daysInTargetMonth);
    return new Date(firstOfTarget.getFullYear(), firstOfTarget.getMonth(), day);
  }

  private addYearsClamped(date: Date, years: number): Date {
    const originalDay = date.getDate();
    const firstOfTarget = new Date(date.getFullYear() + years, date.getMonth(), 1);
    const daysInTargetMonth = new Date(
      firstOfTarget.getFullYear(),
      firstOfTarget.getMonth() + 1,
      0
    ).getDate();
    const day = Math.min(originalDay, daysInTargetMonth);
    return new Date(firstOfTarget.getFullYear(), firstOfTarget.getMonth(), day);
  }
}
