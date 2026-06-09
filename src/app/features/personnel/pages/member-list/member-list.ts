import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { Member, MemberStatus, STATUS_LABELS, RANK_LABELS } from '../../../../core/models/member.model';

@Component({
  selector: 'app-member-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css',
})
export class MemberList implements OnInit {
  members = signal<Member[]>([]);
  loading = signal(true);
  statusFilter = '';

  readonly statusOptions: MemberStatus[] = ['ACTIVE', 'NEW_JOINER', 'INJURED', 'RETIRED', 'PASSED_AWAY'];
  readonly statusLabels = STATUS_LABELS;
  readonly rankLabels = RANK_LABELS;

  readonly statusColors: Record<MemberStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    NEW_JOINER: 'bg-blue-100 text-blue-700',
    INJURED: 'bg-yellow-100 text-yellow-700',
    RETIRED: 'bg-gray-100 text-gray-600',
    PASSED_AWAY: 'bg-red-100 text-red-700',
  };

  constructor(private memberService: MemberService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    const params = this.statusFilter ? { status: this.statusFilter } : undefined;
    this.memberService.getAll(params).subscribe({
      next: members => { this.members.set(members); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  delete(id: number) {
    if (!confirm('Delete this member?')) return;
    this.memberService.remove(id).subscribe(() => this.load());
  }
}
