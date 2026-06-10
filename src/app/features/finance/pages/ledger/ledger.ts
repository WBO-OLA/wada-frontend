import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/finance.service';
import { LedgerEntry, LedgerEntryType, LEDGER_TYPE_LABELS, LEDGER_TYPE_COLORS } from '../../../../core/models/finance.model';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ledger.html',
  styleUrl: './ledger.css',
})
export class LedgerPage implements OnInit {
  private service = inject(FinanceService);

  allEntries = signal<LedgerEntry[]>([]);
  loading = signal(true);
  activeFilter = signal<LedgerEntryType | 'ALL'>('ALL');

  readonly allTypes: (LedgerEntryType | 'ALL')[] = [
    'ALL',
    'INCOME_RECEIVED',
    'BUDGET_CREATED', 'BUDGET_ACTIVATED', 'BUDGET_CLOSED',
    'EXPENSE_SUBMITTED', 'EXPENSE_APPROVED', 'EXPENSE_REJECTED',
  ];

  readonly typeLabels = LEDGER_TYPE_LABELS;
  readonly typeColors = LEDGER_TYPE_COLORS;

  entries = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'ALL') return this.allEntries();
    return this.allEntries().filter(e => e.type === filter);
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.getLedger().subscribe({
      next: entries => { this.allEntries.set(entries); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setFilter(type: LedgerEntryType | 'ALL') {
    this.activeFilter.set(type);
  }

  filterLabel(type: LedgerEntryType | 'ALL'): string {
    if (type === 'ALL') return 'All';
    return this.typeLabels[type];
  }

  isIncomeType(type: LedgerEntryType): boolean {
    return type === 'INCOME_RECEIVED';
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
