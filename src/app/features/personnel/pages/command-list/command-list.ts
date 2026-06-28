import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommandService } from '../../services/command.service';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Command, CommandType, CommandWithDepth, COMMAND_TYPE_LABELS } from '../../../../core/models/command.model';
import { Member, RANK_LABELS } from '../../../../core/models/member.model';
import { buildCommandTree } from '../../../../core/utils/command-tree';

export type SectionItem = { kind: 'section'; label: string; count: number; colorKey: string };
export type NodeItem    = { kind: 'node'; cmd: CommandWithDepth };
export type DisplayItem = SectionItem | NodeItem;

@Component({
  selector: 'app-command-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule, FormsModule],
  templateUrl: './command-list.html',
  styleUrl: './command-list.css',
})
export class CommandList implements OnInit {
  private fb = inject(FormBuilder);
  private commandService = inject(CommandService);
  private memberService = inject(MemberService);
  private auth = inject(AuthService);

  commands = signal<Command[]>([]);
  tree = signal<CommandWithDepth[]>([]);
  members = signal<Member[]>([]);
  loading = signal(true);
  error = signal('');
  editingId = signal<number | null>(null);
  assigningCommandId = signal<number | null>(null);
  assigningMemberId = signal<number | null>(null);
  assignError = signal('');
  showForm = signal(false);

  get canEdit(): boolean { return this.auth.canEdit(); }

  readonly types: CommandType[] = ['CHIEF', 'ZONE', 'BRIGADE', 'REGION', 'UNIT'];
  readonly typeLabels = COMMAND_TYPE_LABELS;
  readonly rankLabels = RANK_LABELS;

  readonly typeShortLabels: Record<CommandType, string> = {
    CHIEF: 'CHIEF', ZONE: 'ZONE', BRIGADE: 'BRIGADE', REGION: 'REGION', UNIT: 'UNIT',
  };

  // ── Stats ────────────────────────────────────────────────────────────
  zoneCount     = computed(() => this.tree().filter(c => c.type === 'ZONE').length);
  brigadeCount  = computed(() => this.tree().filter(c => c.type === 'BRIGADE').length);
  totalCount    = computed(() => this.tree().length);
  withCommander = computed(() => this.tree().filter(c => !!c.commander).length);

  // ── Display list with section headers ────────────────────────────────
  displayItems = computed((): DisplayItem[] => {
    const tree = this.tree();
    const result: DisplayItem[] = [];

    const chiefs   = tree.filter(c => c.depth === 0);
    const directChildren = tree.filter(c => c.depth === 1);
    const directZones    = directChildren.filter(c => c.type === 'ZONE');
    const directBrigades = directChildren.filter(c => c.type === 'BRIGADE');
    const directOthers   = directChildren.filter(c => c.type !== 'ZONE' && c.type !== 'BRIGADE');

    chiefs.forEach(c => result.push({ kind: 'node', cmd: c }));

    if (directZones.length > 0) {
      result.push({ kind: 'section', label: 'Zone Commands', count: directZones.length, colorKey: 'blue' });
      for (const z of directZones) {
        result.push({ kind: 'node', cmd: z });
        this.subtreeOf(z.id!, tree).forEach(c => result.push({ kind: 'node', cmd: c }));
      }
    }

    if (directBrigades.length > 0) {
      result.push({ kind: 'section', label: 'Brigade Commands', count: directBrigades.length, colorKey: 'amber' });
      for (const b of directBrigades) {
        result.push({ kind: 'node', cmd: b });
        this.subtreeOf(b.id!, tree).forEach(c => result.push({ kind: 'node', cmd: c }));
      }
    }

    directOthers.forEach(o => {
      result.push({ kind: 'node', cmd: o });
      this.subtreeOf(o.id!, tree).forEach(c => result.push({ kind: 'node', cmd: c }));
    });

    return result;
  });

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['' as string | null],
    type: ['UNIT' as CommandType, Validators.required],
    parentId: [null as number | null],
    commanderId: [null as number | null],
  });

  ngOnInit() {
    this.load();
    this.memberService.getAll().subscribe({ next: m => this.members.set(m), error: () => {} });
  }

  load() {
    this.loading.set(true);
    this.commandService.getAll().subscribe({
      next: commands => {
        this.commands.set(commands);
        this.tree.set(buildCommandTree(commands));
        this.loading.set(false);
      },
      error: () => { this.error.set('Failed to load command structure.'); this.loading.set(false); },
    });
  }

  // ── Commander assignment ──────────────────────────────────────────────
  startAssignCommander(command: Command) {
    this.assigningCommandId.set(command.id ?? null);
    this.assigningMemberId.set(command.commander?.id ?? null);
    this.assignError.set('');
  }

  cancelAssign() {
    this.assigningCommandId.set(null);
    this.assigningMemberId.set(null);
    this.assignError.set('');
  }

  confirmAssign() {
    const commandId = this.assigningCommandId();
    if (commandId === null) return;
    this.commandService.assignCommander(commandId, this.assigningMemberId()).subscribe({
      next: () => { this.cancelAssign(); this.load(); },
      error: (err: unknown) => this.assignError.set(this.extractMessage(err, 'Failed to assign commander.')),
    });
  }

  membersForCommand(commandId: number | null): Member[] {
    if (commandId === null) return [];
    return this.members().filter(m => m.command?.id === commandId);
  }

  memberDisplayName(m: Member): string {
    return `${this.rankLabels[m.rank] ?? m.rank} ${m.firstName} ${m.lastName} (${m.militaryId})`;
  }

  // ── Create / edit ────────────────────────────────────────────────────
  parentOptionsFor(editingId: number | null): CommandWithDepth[] {
    if (editingId === null) return this.tree();
    const excluded = new Set<number>([editingId]);
    for (const command of this.tree()) {
      if (command.parent && excluded.has(command.parent.id) && command.id !== undefined) {
        excluded.add(command.id);
      }
    }
    return this.tree().filter(c => c.id === undefined || !excluded.has(c.id));
  }

  startCreate() {
    this.editingId.set(null);
    this.form.reset({ name: '', description: '', type: 'UNIT', parentId: null, commanderId: null });
    this.form.get('commanderId')!.clearValidators();
    this.form.get('commanderId')!.updateValueAndValidity();
  }

  startEdit(command: Command) {
    this.editingId.set(command.id ?? null);
    this.form.reset({
      name: command.name,
      description: command.description ?? '',
      type: command.type,
      parentId: command.parent?.id ?? null,
      commanderId: command.commander?.id ?? null,
    });
    this.form.get('commanderId')!.setValidators(Validators.required);
    this.form.get('commanderId')!.updateValueAndValidity();
  }

  cancelEdit() { this.startCreate(); this.showForm.set(false); }

  save() {
    if (this.form.invalid) return;
    this.error.set('');
    const value = this.form.getRawValue();
    const request = {
      name: value.name!, description: value.description ?? undefined,
      type: value.type!, parentId: value.parentId, commanderId: value.commanderId,
    };
    const id = this.editingId();
    (id !== null ? this.commandService.update(id, request) : this.commandService.create(request))
      .subscribe({
        next: () => { this.startCreate(); this.showForm.set(false); this.load(); },
        error: (err: unknown) => this.error.set(this.extractMessage(err, 'Failed to save command.')),
      });
  }

  delete(command: Command) {
    if (!command.id) return;
    if (!confirm(`Delete "${command.name}"?`)) return;
    this.error.set('');
    this.commandService.remove(command.id).subscribe({
      next: () => this.load(),
      error: (err: unknown) => this.error.set(this.extractMessage(err, 'Failed to delete command.')),
    });
  }

  indentLabel(depth: number, name: string): string {
    return '— '.repeat(depth) + name;
  }

  // ── Styling helpers ───────────────────────────────────────────────────
  cardClass(type: CommandType): string {
    switch (type) {
      case 'CHIEF':   return 'border-slate-700 bg-slate-900';
      case 'ZONE':    return 'border-blue-200 bg-blue-50';
      case 'BRIGADE': return 'border-amber-200 bg-amber-50';
      case 'REGION':  return 'border-purple-200 bg-purple-50';
      default:        return 'border-gray-200 bg-white';
    }
  }

  typeBadgeClass(type: CommandType): string {
    switch (type) {
      case 'CHIEF':   return 'bg-white/20 text-white border border-white/30';
      case 'ZONE':    return 'bg-blue-600 text-white';
      case 'BRIGADE': return 'bg-amber-600 text-white';
      case 'REGION':  return 'bg-purple-600 text-white';
      default:        return 'bg-gray-200 text-gray-700';
    }
  }

  nameClass(type: CommandType): string {
    return type === 'CHIEF' ? 'text-white' : 'text-gray-900';
  }

  descClass(type: CommandType): string {
    return type === 'CHIEF' ? 'text-slate-400' : 'text-gray-400';
  }

  sectionBorderClass(colorKey: string): string {
    return colorKey === 'blue' ? 'border-blue-200 bg-blue-50/50' : 'border-amber-200 bg-amber-50/50';
  }

  sectionLabelClass(colorKey: string): string {
    return colorKey === 'blue' ? 'text-blue-700' : 'text-amber-700';
  }

  sectionCountClass(colorKey: string): string {
    return colorKey === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  private subtreeOf(parentId: number, tree: CommandWithDepth[]): CommandWithDepth[] {
    const result: CommandWithDepth[] = [];
    for (const child of tree.filter(c => c.parent?.id === parentId)) {
      result.push(child);
      if (child.id) result.push(...this.subtreeOf(child.id, tree));
    }
    return result;
  }

  private extractMessage(err: unknown, fallback: string): string {
    return (err as { error?: { message?: string } })?.error?.message ?? fallback;
  }
}
