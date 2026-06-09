import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceService } from '../../services/finance.service';
import { Income } from '../../../../core/models/finance.model';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './income.html',
  styleUrl: './income.css',
})
export class IncomePage implements OnInit {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    title: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    source: [''],
    category: [''],
    receivedDate: [''],
    reference: [''],
    recordedBy: ['', Validators.required],
    notes: [''],
  });

  incomes = signal<Income[]>([]);
  loading = signal(false);
  showForm = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');

  private financeService = inject(FinanceService);

  constructor() {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.financeService.getIncomes().subscribe({
      next: (data) => { this.incomes.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    this.financeService.createIncome(this.form.value as any).subscribe({
      next: () => {
        this.success.set('Income recorded.');
        this.form.reset();
        this.showForm.set(false);
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Error recording income.');
        this.saving.set(false);
      },
    });
  }

  delete(id: number) {
    this.financeService.deleteIncome(id).subscribe({
      next: () => { this.success.set('Income entry deleted.'); this.load(); },
      error: (err: any) => this.error.set(err?.error?.message ?? 'Error deleting income.'),
    });
  }
}
