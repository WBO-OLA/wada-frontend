import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { AssetAssignmentService } from '../../services/asset-assignment.service';
import { ItemService } from '../../services/item.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MemberService } from '../../../personnel/services/member.service';
import { CommandService } from '../../../personnel/services/command.service';
import { AssetAssignment } from '../../../../core/models/asset-assignment.model';
import { Item } from '../../../../core/models/item.model';
import { Member } from '../../../../core/models/member.model';
import { CommandWithDepth } from '../../../../core/models/command.model';
import { buildCommandTree } from '../../../../core/utils/command-tree';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './assignments.html',
  styleUrl: './assignments.css',
})
export class AssignmentsPage implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(AssetAssignmentService);
  private itemService = inject(ItemService);
  private memberService = inject(MemberService);
  private commandService = inject(CommandService);
  private auth = inject(AuthService);

  get canEdit(): boolean { return this.auth.canEdit(); }
  get currentUser(): string { return this.auth.getUser()?.username ?? ''; }

  assignments = signal<AssetAssignment[]>([]);
  items = signal<Item[]>([]);
  allMembers = signal<Member[]>([]);
  commands = signal<CommandWithDepth[]>([]);
  loading = signal(true);
  showForm = signal(false);
  submitting = signal(false);
  error = signal('');

  selectedCommandId = signal<string>('');
  selectedMember = signal<Member | null>(null);

  form = this.fb.group({
    itemId:   [null as number | null, Validators.required],
    memberId: [null as number | null, Validators.required],
    notes:    [''],
  });

  filteredMembers = computed(() => {
    const cmdId = this.selectedCommandId();
    if (!cmdId) return this.allMembers();
    return this.allMembers().filter(m => String(m.command?.id) === cmdId);
  });

  ngOnInit() {
    this.load();
    this.itemService.getAll().subscribe({ next: items => this.items.set(items) });
    this.memberService.getAll().subscribe({ next: members => this.allMembers.set(members) });
    this.commandService.getAll().subscribe(cmds => this.commands.set(buildCommandTree(cmds)));
  }

  load() {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: a => { this.assignments.set(a); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onCommandChange(commandId: string) {
    this.selectedCommandId.set(commandId);
    this.clearMemberSelection();
  }

  onMemberChange(memberId: string) {
    if (!memberId) { this.clearMemberSelection(); return; }
    const member = this.allMembers().find(m => String(m.id) === memberId) ?? null;
    this.selectedMember.set(member);
    this.form.patchValue({ memberId: member?.id ?? null });
  }

  clearMemberSelection() {
    this.selectedMember.set(null);
    this.form.patchValue({ memberId: null });
  }

  openForm() {
    this.showForm.set(true);
    this.selectedCommandId.set('');
    this.selectedMember.set(null);
    this.form.reset();
    this.error.set('');
  }

  submit() {
    if (this.form.invalid || !this.selectedMember()) return;
    this.submitting.set(true);
    this.error.set('');
    const v = this.form.value;
    const member = this.selectedMember()!;
    this.service.assign({
      itemId:     v.itemId!,
      memberId:   member.id!,
      memberName: `${member.firstName} ${member.lastName}`,
      assignedBy: this.currentUser,
      notes:      v.notes ?? undefined,
      status:     'ASSIGNED',
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showForm.set(false);
        this.form.reset();
        this.selectedMember.set(null);
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
