import { Component, OnInit, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

import { SubscriptionService } from '../../services/subscription.service';
import { ThemeService } from '../../services/theme.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

// Register Chart.js components
Chart.register(...registerables);

interface Subscription {
  _id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  dueDate: string;
}

interface MonthlySpending {
  month: string;
  amount: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    SkeletonComponent,
    EmptyStateComponent
  ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  subscriptions: Subscription[] = [];
  userEmail: string | null = null;
  username: string | null = null;

  // UI State
  sidebarCollapsed = false;
  isLoading = true;
  mobileMenuOpen = false;

  // Charts
  private spendingByFrequencyChart?: Chart;
  private monthlyTrendChart?: Chart;
  private topSubscriptionsChart?: Chart;
  private costDistributionChart?: Chart;

  // Computed stats
  totalMonthlySpending = signal(0);
  totalYearlySpending = signal(0);
  averageSubscriptionCost = signal(0);
  mostExpensiveSubscription = signal<string>('N/A');

  constructor(
    private subscriptionService: SubscriptionService,
    private themeService: ThemeService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
    this.userEmail = localStorage.getItem('userEmail');
    this.username = localStorage.getItem('username');
  }

  ngAfterViewInit(): void {
    // Charts will be created after data is loaded
  }

  ngOnDestroy(): void {
    // Cleanup charts
    this.spendingByFrequencyChart?.destroy();
    this.monthlyTrendChart?.destroy();
    this.topSubscriptionsChart?.destroy();
    this.costDistributionChart?.destroy();
  }

  loadSubscriptions(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.subscriptionService.getSubscriptions(userId).subscribe({
      next: (subs) => {
        this.subscriptions = subs;
        this.calculateStats();
        this.isLoading = false;

        // Wait for next tick to ensure canvas elements are rendered
        setTimeout(() => this.initializeCharts(), 0);
      },
      error: (err) => {
        console.error('Failed to load subscriptions', err);
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    if (this.subscriptions.length === 0) return;

    let monthlyTotal = 0;
    let yearlyTotal = 0;

    this.subscriptions.forEach(sub => {
      const amount = sub.amount || 0;
      if (sub.frequency === 'monthly') {
        monthlyTotal += amount;
        yearlyTotal += amount * 12;
      } else if (sub.frequency === 'yearly') {
        monthlyTotal += amount / 12;
        yearlyTotal += amount;
      }
    });

    this.totalMonthlySpending.set(monthlyTotal);
    this.totalYearlySpending.set(yearlyTotal);
    this.averageSubscriptionCost.set(
      this.subscriptions.length > 0 ? monthlyTotal / this.subscriptions.length : 0
    );

    // Find most expensive subscription
    const mostExpensive = this.subscriptions.reduce((prev, current) => {
      const prevMonthly = prev.frequency === 'monthly' ? prev.amount : prev.amount / 12;
      const currentMonthly = current.frequency === 'monthly' ? current.amount : current.amount / 12;
      return currentMonthly > prevMonthly ? current : prev;
    }, this.subscriptions[0]);

    this.mostExpensiveSubscription.set(mostExpensive?.name || 'N/A');
  }

  initializeCharts(): void {
    if (this.subscriptions.length === 0) return;

    const isDark = this.themeService.currentTheme() === 'dark';
    const colors = this.getChartColors(isDark);

    this.createSpendingByFrequencyChart(colors, isDark);
    this.createMonthlyTrendChart(colors, isDark);
    this.createTopSubscriptionsChart(colors, isDark);
    this.createCostDistributionChart(colors, isDark);
  }

  private getChartColors(isDark: boolean) {
    return {
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#8b5cf6',
      warning: '#f59e0b',
      error: '#ef4444',
      text: isDark ? '#e5e7eb' : '#1f2937',
      textSecondary: isDark ? '#9ca3af' : '#6b7280',
      grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      background: isDark ? '#1f2937' : '#ffffff'
    };
  }

  private createSpendingByFrequencyChart(colors: any, isDark: boolean): void {
    const canvas = document.getElementById('spendingByFrequencyChart') as HTMLCanvasElement;
    if (!canvas) return;

    const monthlyCount = this.subscriptions.filter(s => s.frequency === 'monthly').length;
    const yearlyCount = this.subscriptions.filter(s => s.frequency === 'yearly').length;

    const monthlySpend = this.subscriptions
      .filter(s => s.frequency === 'monthly')
      .reduce((sum, s) => sum + s.amount, 0);

    const yearlySpend = this.subscriptions
      .filter(s => s.frequency === 'yearly')
      .reduce((sum, s) => sum + s.amount, 0);

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Monthly', 'Yearly'],
        datasets: [{
          label: 'Subscriptions',
          data: [monthlyCount, yearlyCount],
          backgroundColor: [colors.primary, colors.secondary],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: colors.text,
              font: { size: 12, family: 'Inter, system-ui, sans-serif' },
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            titleColor: colors.text,
            bodyColor: colors.text,
            borderColor: colors.grid,
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const spend = context.dataIndex === 0 ? monthlySpend : yearlySpend;
                return [`${label}: ${value} subscriptions`, `Total: $${spend.toFixed(2)}`];
              }
            }
          }
        }
      }
    };

    this.spendingByFrequencyChart = new Chart(canvas, config);
  }

  private createMonthlyTrendChart(colors: any, isDark: boolean): void {
    const canvas = document.getElementById('monthlyTrendChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Generate next 12 months spending projection
    const months: string[] = [];
    const spending: number[] = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      spending.push(this.totalMonthlySpending());
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Monthly Spending',
          data: spending,
          borderColor: colors.primary,
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors.primary,
          pointBorderColor: colors.background,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            titleColor: colors.text,
            bodyColor: colors.text,
            borderColor: colors.grid,
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => `$${(context.parsed.y ?? 0).toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: colors.grid
            },
            ticks: {
              color: colors.textSecondary,
              font: { size: 11, family: 'Inter, system-ui, sans-serif' },
              callback: (value) => `$${value}`
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: colors.textSecondary,
              font: { size: 11, family: 'Inter, system-ui, sans-serif' },
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    };

    this.monthlyTrendChart = new Chart(canvas, config);
  }

  private createTopSubscriptionsChart(colors: any, isDark: boolean): void {
    const canvas = document.getElementById('topSubscriptionsChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Get top 5 subscriptions by monthly cost
    const sortedSubs = [...this.subscriptions]
      .map(sub => ({
        name: sub.name,
        monthlyCost: sub.frequency === 'monthly' ? sub.amount : sub.amount / 12
      }))
      .sort((a, b) => b.monthlyCost - a.monthlyCost)
      .slice(0, 5);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: sortedSubs.map(s => s.name),
        datasets: [{
          label: 'Monthly Cost',
          data: sortedSubs.map(s => s.monthlyCost),
          backgroundColor: [
            colors.primary,
            colors.secondary,
            colors.accent,
            colors.warning,
            colors.error
          ],
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            titleColor: colors.text,
            bodyColor: colors.text,
            borderColor: colors.grid,
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => `$${(context.parsed.y ?? 0).toFixed(2)}/month`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: colors.grid
            },
            ticks: {
              color: colors.textSecondary,
              font: { size: 11, family: 'Inter, system-ui, sans-serif' },
              callback: (value) => `$${value}`
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: colors.textSecondary,
              font: { size: 11, family: 'Inter, system-ui, sans-serif' }
            }
          }
        }
      }
    };

    this.topSubscriptionsChart = new Chart(canvas, config);
  }

  private createCostDistributionChart(colors: any, isDark: boolean): void {
    const canvas = document.getElementById('costDistributionChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Group subscriptions by price ranges
    const ranges = [
      { label: '$0-10', min: 0, max: 10, count: 0 },
      { label: '$10-25', min: 10, max: 25, count: 0 },
      { label: '$25-50', min: 25, max: 50, count: 0 },
      { label: '$50-100', min: 50, max: 100, count: 0 },
      { label: '$100+', min: 100, max: Infinity, count: 0 }
    ];

    this.subscriptions.forEach(sub => {
      const monthlyCost = sub.frequency === 'monthly' ? sub.amount : sub.amount / 12;
      const range = ranges.find(r => monthlyCost >= r.min && monthlyCost < r.max);
      if (range) range.count++;
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ranges.map(r => r.label),
        datasets: [{
          label: 'Number of Subscriptions',
          data: ranges.map(r => r.count),
          backgroundColor: colors.accent,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            titleColor: colors.text,
            bodyColor: colors.text,
            borderColor: colors.grid,
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => `${context.parsed.y} subscription${context.parsed.y !== 1 ? 's' : ''}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: colors.grid
            },
            ticks: {
              color: colors.textSecondary,
              font: { size: 11, family: 'Inter, system-ui, sans-serif' },
              stepSize: 1
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: colors.textSecondary,
              font: { size: 11, family: 'Inter, system-ui, sans-serif' }
            }
          }
        }
      }
    };

    this.costDistributionChart = new Chart(canvas, config);
  }

  // Event handlers
  onSidebarCollapse(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  onLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
