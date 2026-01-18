import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-subscription-card',
  standalone: true,
  imports: [CommonModule, DatePipe, ConfirmModalComponent],
  templateUrl: './subscription-card.component.html',
  styleUrls: ['./subscription-card.component.scss']
})
export class SubscriptionCardComponent implements OnInit, OnChanges {
  @Input() id!: string;
  @Input() name!: string;
  @Input() amount!: number;
  @Input() frequency!: string;
  @Input() dueDate!: string;
  @Input() recommendation!: boolean;

  @Output() delete = new EventEmitter<string>();
  @Output() paid = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();

  showDeleteModal = false;
  daysUntilDue: number | null = null;
  isUpcoming = false;

  ngOnInit(): void {
    this.calculateDaysUntilDue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dueDate'] || changes['frequency']) {
      this.calculateDaysUntilDue();
    }
  }

  get canMarkPaid(): boolean {
    return this.daysUntilDue !== null && this.daysUntilDue <= this.getPaidWindowDays();
  }

  private calculateDaysUntilDue(): void {
    if (!this.dueDate) return;

    const today = this.startOfDay(new Date());

    const due = this.parseLocalDate(this.dueDate);
    if (!due) return;

    const diffTime = due.getTime() - today.getTime();
    this.daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.isUpcoming = this.daysUntilDue <= 7 && this.daysUntilDue >= 0;
  }

  onPaidClick(): void {
    if (!this.canMarkPaid) return;
    this.paid.emit(this.id);
  }

  onDeleteClick(): void {
    this.showDeleteModal = true;
  }

  onEditClick(): void {
    this.edit.emit(this.id);
  }

  confirmDelete(): void {
    this.showDeleteModal = false;
    this.delete.emit(this.id);
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private parseLocalDate(value: string): Date | null {
    if (!value) return null;

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

  private getPaidWindowDays(): number {
    return this.frequency === 'yearly' ? 30 : 7;
  }
}
