import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/finance.service';
import {
  LedgerEntry, LedgerEntryType,
  LEDGER_TYPE_LABELS, LEDGER_TYPE_COLORS
} from '../../../../core/models/finance.model';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ledger.html',
  styleUrl: './ledger.css',
})
export class LedgerPage implements OnInit {
  private service = inject(FinanceService);

  entries = signal<LedgerEntry[]>([]);
  loading = signal(true);
  activeFilter = signal<LedgerEntryType | undefined>(undefined);

  readonly typeLabels = LEDGER_TYPE_LABELS;
  readonly typeColors = LEDGER_TYPE_COLORS;
  readonly allTypes: LedgerEntryType[] = [
    'BUDGET_CREATED', 'BUDGET_ACTIVATED', 'BUDGET_CLOSED',
    'EXPENSE_SUBMITTED', 'EXPENSE_APPROVED', 'EXPENSE_REJECTED',
    'INCOME_RECEIVED'
  ];

  ngOnInit() { this.load(); }

  load(type?: LedgerEntryType) {
    this.loading.set(true);
    this.activeFilter.set(type);
    this.service.getLedger(type).subscribe({
      next: entries => { this.entries.set(entries); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  formatDate(dt: string): string {
    return new Date(dt).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  }
}
