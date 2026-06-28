import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommandService } from '../../services/command.service';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Command, CommandType, CommandWithDepth, COMMAND_TYPE_LABELS } from '../../../../core/models/command.model';
import { Member, RANK_LABELS } from '../../../../core/models/member.model';
import { buildCommandTree } from '../../../../core/utils/command-tree';

@Component({
  selector: 'app-command-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
    CHIEF: 'CHIEF',
    ZONE: 'ZONE',
    BRIGADE: 'BRIGADE',
    REGION: 'REGION',
    UNIT: 'UNIT',
  };

  cardClass(type: CommandType): string {
    switch (type) {
      case 'CHIEF':   return 'border-slate-700 bg-slate-900 text-white';
      case 'ZONE':    return 'border-blue-200 bg-blue-50';
      case 'BRIGADE': return 'border-amber-200 bg-amber-50';
      case 'REGION':  return 'border-purple-200 bg-purple-50';
      default:        return 'border-gray-200 bg-white';
    }
  }

  typeBadgeClass(type: CommandType): string {
    switch (type) {
      case 'CHIEF':   return 'bg-white text-slate-900';
      case 'ZONE':    return 'bg-blue-600 text-white';
      case 'BRIGADE': return 'bg-amber-600 text-white';
      case 'REGION':  return 'bg-purple-600 text-white';
      default:        return 'bg-gray-200 text-gray-700';
    }
  }

  nameClass(type: CommandType): string {
    return type === 'CHIEF' ? 'text-white' : 'text-gray-900';
  }

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['' as string | null],
    type: ['UNIT' as CommandType, Validators.required],
    parentId: [null as number | null],
    commanderId: [null as number | null],
  });

  constructor() {}

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
      error: () => {
        this.error.set('Failed to load command structure.');
        this.loading.set(false);
      },
    });
  }

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

  memberDisplayName(m: Member): string {
    return `${this.rankLabels[m.rank] ?? m.rank} ${m.firstName} ${m.lastName} (${m.militaryId})`;
  }

  /** Members who belong to the given command — eligible to be its commander. */
  membersForCommand(commandId: number | null): Member[] {
    if (commandId === null) return [];
    return this.members().filter(m => m.command?.id === commandId);
  }

  // Parents selectable when editing must exclude the command itself and its descendants.
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

  cancelEdit() {
    this.startCreate();
    this.showForm.set(false);
  }

  save() {
    if (this.form.invalid) return;
    this.error.set('');
    const value = this.form.getRawValue();
    const request = { name: value.name!, description: value.description ?? undefined, type: value.type!, parentId: value.parentId, commanderId: value.commanderId };
    const id = this.editingId();

    const result$ = id !== null
      ? this.commandService.update(id, request)
      : this.commandService.create(request);

    result$.subscribe({
      next: () => {
        this.startCreate();
        this.showForm.set(false);
        this.load();
      },
      error: (err: unknown) => this.error.set(this.extractMessage(err, 'Failed to save command.')),
    });
  }

  delete(command: Command) {
    if (!command.id) return;
    if (!confirm(`Delete command "${command.name}"?`)) return;
    this.error.set('');
    this.commandService.remove(command.id).subscribe({
      next: () => this.load(),
      error: (err: unknown) => this.error.set(this.extractMessage(err, 'Failed to delete command.')),
    });
  }

  indentLabel(depth: number, name: string): string {
    return '— '.repeat(depth) + name;
  }

  private extractMessage(err: unknown, fallback: string): string {
    const message = (err as { error?: { message?: string } })?.error?.message;
    return message ?? fallback;
  }
}
