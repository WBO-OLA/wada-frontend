import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import {
  PurchaseOrder, OrderStatus,
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS
} from '../../../../core/models/purchase-order.model';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './purchase-orders.html',
  styleUrl: './purchase-orders.css',
})
export class PurchaseOrdersPage implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(PurchaseOrderService);

  orders = signal<PurchaseOrder[]>([]);
  loading = signal(true);
  showForm = signal(false);
  submitting = signal(false);
  error = signal('');

  readonly statusLabels = ORDER_STATUS_LABELS;
  readonly statusColors = ORDER_STATUS_COLORS;
  readonly allStatuses: OrderStatus[] = ['PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED'];

  form = this.fb.group({
    supplier: ['', Validators.required],
    itemName: ['', Validators.required],
    itemSku: [''],
    quantity: [1, [Validators.required, Validators.min(1)]],
    unitPrice: [0, [Validators.required, Validators.min(0.01)]],
    orderedBy: [''],
    expectedDeliveryDate: [''],
    notes: [''],
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: orders => { this.orders.set(orders); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.error.set('');
    this.service.create(this.form.value as Partial<PurchaseOrder>).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showForm.set(false);
        this.form.reset({ quantity: 1, unitPrice: 0 });
        this.load();
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Failed to create order.');
        this.submitting.set(false);
      },
    });
  }

  changeStatus(order: PurchaseOrder, event: Event) {
    const status = (event.target as HTMLSelectElement).value as OrderStatus;
    if (!order.id || status === order.status) return;
    this.service.updateStatus(order.id, status).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
      },
    });
  }

  delete(id: number) {
    if (!confirm('Delete this purchase order?')) return;
    this.service.delete(id).subscribe(() => this.load());
  }

  formatCurrency(val: number | undefined): string {
    if (val == null) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  }
}
