import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { WarehouseService } from '../../services/warehouse.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Item } from '../../../../core/models/item.model';
import { Warehouse } from '../../../../core/models/warehouse.model';

@Component({
  selector: 'app-stock-management',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './stock-management.html',
  styleUrl: './stock-management.css',
})
export class StockManagement implements OnInit {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    itemId: [null as number | null, Validators.required],
    warehouseId: [null as number | null, Validators.required],
    quantity: [null as number | null, [Validators.required, Validators.min(1)]],
    referenceNumber: [''],
    notes: [''],
  });

  items = signal<Item[]>([]);
  warehouses = signal<Warehouse[]>([]);
  saving = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  private itemService = inject(ItemService);
  private warehouseService = inject(WarehouseService);
  private auth = inject(AuthService);

  get currentUser(): string { return this.auth.getUser()?.username ?? ''; }

  constructor() {}

  ngOnInit() {
    this.itemService.getAll().subscribe(items => this.items.set(items));
    this.warehouseService.getActive().subscribe(w => this.warehouses.set(w));
  }

  stockIn() {
    if (this.form.invalid) return;
    this.submit('in');
  }

  stockOut() {
    if (this.form.invalid) return;
    this.submit('out');
  }

  private submit(type: 'in' | 'out') {
    this.saving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
    const value = this.form.value as any;
    const request = { ...value, performedBy: this.currentUser };
    const action = type === 'in'
      ? this.itemService.stockIn(request)
      : this.itemService.stockOut(request);
    action.subscribe({
      next: () => {
        this.successMessage.set(`Stock ${type === 'in' ? 'received' : 'issued'} successfully.`);
        this.form.reset();
        this.saving.set(false);
      },
      error: (err: any) => {
        this.errorMessage.set(err?.error?.message ?? 'An error occurred.');
        this.saving.set(false);
      },
    });
  }
}
