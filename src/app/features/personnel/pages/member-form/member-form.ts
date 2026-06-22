import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { CommandService } from '../../services/command.service';
import { MilitaryRank, MemberStatus, STATUS_LABELS, RANK_LABELS } from '../../../../core/models/member.model';
import { CommandWithDepth } from '../../../../core/models/command.model';
import { buildCommandTree } from '../../../../core/utils/command-tree';

@Component({
  selector: 'app-member-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './member-form.html',
  styleUrl: './member-form.css',
})
export class MemberForm implements OnInit {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    militaryId: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    nationalId: [''],
    phone: [''],
    email: ['', Validators.email],
    dateOfBirth: [''],
    joinDate: [''],
    rank: ['RECRUIT' as MilitaryRank, Validators.required],
    commandId: [null as number | null, Validators.required],
    status: ['ACTIVE' as MemberStatus, Validators.required],
    notes: [''],
  });

  commands = signal<CommandWithDepth[]>([]);

  isEdit = signal(false);
  memberId = signal<number | null>(null);
  saving = signal(false);

  readonly ranks: MilitaryRank[] = [
    'RECRUIT', 'PRIVATE', 'CORPORAL', 'SERGEANT', 'STAFF_SERGEANT',
    'WARRANT_OFFICER', 'SECOND_LIEUTENANT', 'FIRST_LIEUTENANT', 'CAPTAIN',
    'MAJOR', 'LIEUTENANT_COLONEL', 'COLONEL', 'BRIGADIER_GENERAL',
    'MAJOR_GENERAL', 'LIEUTENANT_GENERAL', 'GENERAL',
  ];
  readonly statuses: MemberStatus[] = ['ACTIVE', 'INJURED', 'RETIRED', 'PASSED_AWAY'];
  readonly rankLabels = RANK_LABELS;
  readonly statusLabels = STATUS_LABELS;

  private memberService = inject(MemberService);
  private commandService = inject(CommandService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {}

  ngOnInit() {
    this.commandService.getAll().subscribe(commands => this.commands.set(buildCommandTree(commands)));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.memberId.set(Number(id));
      this.memberService.getById(Number(id)).subscribe(m => {
        this.form.patchValue({ ...m, commandId: m.command?.id ?? null } as any);
      });
    }
  }

  indentLabel(depth: number, name: string): string {
    return '— '.repeat(depth) + name;
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const value = this.form.value as any;
    const action = this.isEdit()
      ? this.memberService.update(this.memberId()!, value)
      : this.memberService.create(value);
    action.subscribe({
      next: () => this.router.navigate(['/personnel']),
      error: () => this.saving.set(false),
    });
  }
}
