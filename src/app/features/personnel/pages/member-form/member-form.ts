import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { CommandService } from '../../services/command.service';
import { MilitaryRank, MemberRole, MemberStatus, Gender, STATUS_LABELS, RANK_LABELS, MEMBER_ROLE_LABELS } from '../../../../core/models/member.model';
import { CommandWithDepth } from '../../../../core/models/command.model';
import { buildCommandTree } from '../../../../core/utils/command-tree';
import { pastOrTodayValidator, minAgeValidator, todayIso, maxDobIso } from '../../../../core/utils/date-validators';

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
    gender: [null as Gender | null, Validators.required],
    nationality: ['', Validators.required],
    nationalId: [''],
    phone: [''],
    email: ['', [Validators.required, Validators.email]],
    dateOfBirth: ['', minAgeValidator(18)],
    joinDate: ['', pastOrTodayValidator()],
    rank: ['RECRUIT' as MilitaryRank, Validators.required],
    memberRole: [null as MemberRole | null, Validators.required],
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
  readonly genders: Gender[] = ['MALE', 'FEMALE'];
  readonly statuses: MemberStatus[] = ['ACTIVE', 'INJURED', 'RETIRED', 'PASSED_AWAY'];
  readonly memberRoles: MemberRole[] = [
    'COMMANDER', 'DEPUTY_COMMANDER', 'TAKIYAA', 'SAGILII', 'ABBAA_BUTTAA',
    'INTELLIGENCE_OFFICER', 'LOGISTICS_OFFICER', 'FINANCE_OFFICER',
    'MEDICAL_OFFICER', 'COMMUNICATIONS_OFFICER', 'TRAINING_OFFICER',
    'FIELD_OFFICER', 'SQUAD_LEADER', 'MEMBER',
  ];
  readonly rankLabels = RANK_LABELS;
  readonly statusLabels = STATUS_LABELS;
  readonly memberRoleLabels = MEMBER_ROLE_LABELS;
  readonly today = todayIso();
  readonly maxDob = maxDobIso(18);

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
    this.form.markAllAsTouched();
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
