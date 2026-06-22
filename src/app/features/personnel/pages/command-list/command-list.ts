import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommandService } from '../../services/command.service';
import { Command, CommandType, CommandWithDepth, COMMAND_TYPE_LABELS } from '../../../../core/models/command.model';
import { buildCommandTree } from '../../../../core/utils/command-tree';

@Component({
  selector: 'app-command-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './command-list.html',
  styleUrl: './command-list.css',
})
export class CommandList implements OnInit {
  private fb = inject(FormBuilder);
  private commandService = inject(CommandService);

  commands = signal<Command[]>([]);
  tree = signal<CommandWithDepth[]>([]);
  loading = signal(true);
  error = signal('');
  editingId = signal<number | null>(null);

  readonly types: CommandType[] = ['GLOBAL', 'REGION', 'UNIT'];
  readonly typeLabels = COMMAND_TYPE_LABELS;

  form = this.fb.group({
    name: ['', Validators.required],
    type: ['UNIT' as CommandType, Validators.required],
    parentId: [null as number | null],
  });

  constructor() {}

  ngOnInit() {
    this.load();
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
    this.form.reset({ name: '', type: 'UNIT', parentId: null });
  }

  startEdit(command: Command) {
    this.editingId.set(command.id ?? null);
    this.form.reset({
      name: command.name,
      type: command.type,
      parentId: command.parent?.id ?? null,
    });
  }

  cancelEdit() {
    this.startCreate();
  }

  save() {
    if (this.form.invalid) return;
    this.error.set('');
    const value = this.form.getRawValue();
    const request = { name: value.name!, type: value.type!, parentId: value.parentId };
    const id = this.editingId();

    const result$ = id !== null
      ? this.commandService.update(id, request)
      : this.commandService.create(request);

    result$.subscribe({
      next: () => {
        this.startCreate();
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
