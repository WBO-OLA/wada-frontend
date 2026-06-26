import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AssetAssignmentService } from '../../services/asset-assignment.service';
import { ItemService } from '../../services/item.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AssetAssignment } from '../../../../core/models/asset-assignment.model';
import { Item } from '../../../../core/models/item.model';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assignments.html',
  styleUrl: './assignments.css',
})
export class AssignmentsPage implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(AssetAssignmentService);
  private itemService = inject(ItemService);
  private auth = inject(AuthService);

  get canEdit(): boolean { return this.auth.canEdit(); }
  get currentUser(): string { return this.auth.getUser()?.username ?? ''; }

  assignments = signal<AssetAssignment[]>([]);
  items = signal<Item[]>([]);
  loading = signal(true);
  showForm = signal(false);
  submitting = signal(false);
  error = signal('');

  form = this.fb.group({
    itemId: [null as number | null, Validators.required],
    memberId: [null as number | null, [Validators.required, Validators.min(1)]],
    memberName: ['', Validators.required],
    notes: [''],
  });

  ngOnInit() {
    this.load();
    this.itemService.getAll().subscribe({ next: items => this.items.set(items) });
  }

  load() {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: a => { this.assignments.set(a); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.error.set('');
    const v = this.form.value;
    this.service.assign({
      itemId: v.itemId!,
      memberId: v.memberId!,
      memberName: v.memberName!,
      assignedBy: this.currentUser,
      notes: v.notes ?? undefined,
      status: 'ASSIGNED',
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showForm.set(false);
        this.form.reset();
        this.load();
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Failed to assign asset.');
        this.submitting.set(false);
      },
    });
  }

  returnItem(id: number) {
    if (!confirm('Mark this asset as returned?')) return;
    this.service.returnItem(id).subscribe({
      next: updated => this.assignments.update(list => list.map(a => a.id === updated.id ? updated : a)),
      error: (err: any) => this.error.set(err?.error?.message ?? 'Failed to return asset.'),
    });
  }

  formatDate(dt: string | undefined): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
