import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { ItemService } from '../../services/item.service';
import { WarehouseService } from '../../services/warehouse.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CommandService } from '../../../personnel/services/command.service';
import { Item } from '../../../../core/models/item.model';
import { Warehouse } from '../../../../core/models/warehouse.model';
import { Command } from '../../../../core/models/command.model';

@Component({
  selector: 'app-item-list',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemList implements OnInit {
  private itemService = inject(ItemService);
  private warehouseService = inject(WarehouseService);
  private commandService = inject(CommandService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  items = signal<Item[]>([]);
  warehouses = signal<Warehouse[]>([]);
  commands = signal<Command[]>([]);
  commandFilter = signal<number | null>(null);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  error = signal('');
  success = signal('');

  searchTerm = signal('');
  categoryFilter = signal('');
  warehouseFilter = signal('');

  form = this.fb.group({
    name:        ['', Validators.required],
    sku:         ['', Validators.required],
    description: [''],
    category:    [''],
    quantity:    [0, [Validators.required, Validators.min(0)]],
    unitPrice:   [0, [Validators.required, Validators.min(0)]],
    warehouseId: [null as number | null],
    commandId:   [null as number | null],
  });

  get canEdit(): boolean { return this.auth.canEdit(); }

  commandName(id: number | null | undefined): string {
    if (!id) return '';
    const c = this.commands().find(x => x.id === id);
    return c ? (c.name + (c.description ? ` (${c.description})` : '')) : '';
  }

  categories = computed(() =>
    [...new Set(this.items().map(i => i.category).filter(Boolean) as string[])].sort()
  );

  totalItems   = computed(() => this.items().length);
  lowStockCount = computed(() => this.items().filter(i => i.quantity < 10).length);
  totalValue   = computed(() => this.items().reduce((s, i) => s + i.quantity * i.unitPrice, 0));
  categoryCount = computed(() => this.categories().length);

  filteredItems = computed(() => {
    let list = this.items();
    const term = this.searchTerm().trim().toLowerCase();
    if (term) list = list.filter(i =>
      i.name.toLowerCase().includes(term) ||
      i.sku.toLowerCase().includes(term)
    );
    if (this.categoryFilter()) list = list.filter(i => i.category === this.categoryFilter());
    if (this.warehouseFilter()) list = list.filter(i => String(i.warehouse?.id) === this.warehouseFilter());
    return list;
  });

  ngOnInit() {
    this.commandService.getAll().subscribe({ next: c => this.commands.set(c), error: () => {} });
    this.load();
    this.warehouseService.getActive().subscribe(w => this.warehouses.set(w));
  }

  load() {
    this.loading.set(true);
    const params: Record<string, string> = {};
    if (this.commandFilter() != null) params['commandIds'] = String(this.commandFilter());
    this.itemService.getAll(Object.keys(params).length ? params : undefined).subscribe({
      next: items => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setCommandFilter(id: number | null) {
    this.commandFilter.set(id);
    this.load();
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ quantity: 0, unitPrice: 0 });
    this.showForm.set(true);
    this.error.set('');
  }

  openEdit(item: Item) {
    this.editingId.set(item.id ?? null);
    this.form.patchValue({
      name: item.name,
      sku: item.sku,
      description: item.description ?? '',
      category: item.category ?? '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      warehouseId: item.warehouse?.id ?? null,
      commandId: item.commandId ?? null,
    });
    this.showForm.set(true);
    this.error.set('');
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form.reset();
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    const payload = this.form.value as any;
    const action = this.editingId()
      ? this.itemService.update(this.editingId()!, payload)
      : this.itemService.create(payload);
    action.subscribe({
      next: (saved) => {
        if (this.editingId()) {
          this.items.update(list => list.map(i => i.id === saved.id ? saved : i));
          this.success.set(`"${saved.name}" updated.`);
        } else {
          this.items.update(list => [saved, ...list]);
          this.success.set(`"${saved.name}" added to inventory.`);
        }
        this.cancelForm();
        this.saving.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Failed to save item.');
        this.saving.set(false);
      },
    });
  }

  delete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    this.itemService.remove(id).subscribe({
      next: () => { this.items.update(list => list.filter(i => i.id !== id)); this.success.set(`"${name}" deleted.`); },
      error: (err: any) => this.error.set(err?.error?.message ?? 'Failed to delete item.'),
    });
  }

  clearFilters() {
    this.searchTerm.set('');
    this.categoryFilter.set('');
    this.warehouseFilter.set('');
  }
}
