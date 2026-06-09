import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { Item } from '../../../../core/models/item.model';

@Component({
  selector: 'app-item-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemList implements OnInit {
  items = signal<Item[]>([]);
  loading = signal(true);

  constructor(private itemService: ItemService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.itemService.getAll().subscribe({
      next: items => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  delete(id: number) {
    if (!confirm('Delete this item?')) return;
    this.itemService.remove(id).subscribe(() => this.load());
  }
}
