import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { MilitaryRank, MemberStatus, STATUS_LABELS, RANK_LABELS } from '../../../../core/models/member.model';

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
    unit: ['', Validators.required],
    status: ['ACTIVE' as MemberStatus, Validators.required],
    notes: [''],
  });

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
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.memberId.set(Number(id));
      this.memberService.getById(Number(id)).subscribe(m => this.form.patchValue(m as any));
    }
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
