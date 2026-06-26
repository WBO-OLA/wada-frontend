import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceService } from '../../services/finance.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Income, IncomeAggregate } from '../../../../core/models/finance.model';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './income.html',
  styleUrl: './income.css',
})
export class IncomePage implements OnInit {
  private fb = inject(FormBuilder);
  private financeService = inject(FinanceService);
  private auth = inject(AuthService);

  get currentUser(): string { return this.auth.getUser()?.username ?? ''; }
  get canEdit(): boolean { return this.auth.canEdit(); }
  get canApprove(): boolean { return this.auth.canApprove(); }

  form = this.fb.group({
    title: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    currency: ['USD', Validators.required],
    communityGroup: ['', Validators.required],
    country: ['', Validators.required],
    source: [''],
    category: [''],
    receivedDate: [''],
    reference: [''],
    notes: [''],
  });

  incomes = signal<Income[]>([]);
  aggregate = signal<IncomeAggregate | null>(null);
  loading = signal(false);
  showForm = signal(false);
  showAggregate = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');

  searchTerm = signal('');
  communityGroupFilter = signal('');
  countryFilter = signal('');

  uniqueGroups = computed(() =>
    [...new Set(this.incomes().map(i => i.communityGroup).filter(Boolean) as string[])].sort()
  );
  uniqueCountries = computed(() =>
    [...new Set(this.incomes().map(i => i.country).filter(Boolean) as string[])].sort()
  );

  filteredIncomes = computed(() => {
    let list = this.incomes();
    const term = this.searchTerm().trim().toLowerCase();
    if (term) list = list.filter(i =>
      i.title.toLowerCase().includes(term) ||
      (i.communityGroup ?? '').toLowerCase().includes(term) ||
      (i.country ?? '').toLowerCase().includes(term)
    );
    if (this.communityGroupFilter()) list = list.filter(i => i.communityGroup === this.communityGroupFilter());
    if (this.countryFilter()) list = list.filter(i => i.country === this.countryFilter());
    return list;
  });

  ngOnInit() {
    this.load();
    this.loadAggregate();
  }

  load() {
    this.loading.set(true);
    this.financeService.getIncomes().subscribe({
      next: (data) => { this.incomes.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadAggregate() {
    this.financeService.getIncomeAggregate().subscribe({
      next: (data) => this.aggregate.set(data),
      error: () => {},
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    const payload = { ...this.form.value, recordedBy: this.currentUser };
    this.financeService.createIncome(payload as any).subscribe({
      next: () => {
        this.success.set('Income recorded.');
        this.form.reset({ currency: 'USD' });
        this.showForm.set(false);
        this.saving.set(false);
        this.load();
        this.loadAggregate();
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Error recording income.');
        this.saving.set(false);
      },
    });
  }

  delete(id: number) {
    this.financeService.deleteIncome(id).subscribe({
      next: () => { this.success.set('Income entry deleted.'); this.load(); this.loadAggregate(); },
      error: (err: any) => this.error.set(err?.error?.message ?? 'Error deleting income.'),
    });
  }

  clearFilters() {
    this.searchTerm.set('');
    this.communityGroupFilter.set('');
    this.countryFilter.set('');
  }

  aggregateEntries(map: Record<string, number> | undefined): [string, number][] {
    if (!map) return [];
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }

  formatCurrency(val: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);
  }
}
