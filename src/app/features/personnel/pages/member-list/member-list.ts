import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { CommandService } from '../../services/command.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Member, MemberStatus, STATUS_LABELS, RANK_LABELS, MEMBER_ROLE_LABELS, MEMBER_ROLE_COLORS, MilitaryRank } from '../../../../core/models/member.model';
import { CommandWithDepth } from '../../../../core/models/command.model';
import { buildCommandTree } from '../../../../core/utils/command-tree';

@Component({
  selector: 'app-member-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css',
})
export class MemberList implements OnInit {
  private memberService = inject(MemberService);
  private commandService = inject(CommandService);
  private auth = inject(AuthService);

  members = signal<Member[]>([]);
  commands = signal<CommandWithDepth[]>([]);
  loading = signal(true);

  searchTerm = signal('');
  statusFilter = signal('');
  rankFilter = signal('');
  commandFilter = signal('');

  readonly statusOptions: MemberStatus[] = ['ACTIVE', 'INJURED', 'RETIRED', 'PASSED_AWAY'];
  readonly rankOptions: MilitaryRank[] = [
    'RECRUIT', 'PRIVATE', 'CORPORAL', 'SERGEANT', 'STAFF_SERGEANT',
    'WARRANT_OFFICER', 'SECOND_LIEUTENANT', 'FIRST_LIEUTENANT', 'CAPTAIN',
    'MAJOR', 'LIEUTENANT_COLONEL', 'COLONEL', 'BRIGADIER_GENERAL',
    'MAJOR_GENERAL', 'LIEUTENANT_GENERAL', 'GENERAL',
  ];
  readonly statusLabels = STATUS_LABELS;
  readonly rankLabels = RANK_LABELS;
  readonly memberRoleLabels = MEMBER_ROLE_LABELS;
  readonly memberRoleColors = MEMBER_ROLE_COLORS;

  readonly statusColors: Record<MemberStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    INJURED: 'bg-yellow-100 text-yellow-700',
    RETIRED: 'bg-gray-100 text-gray-600',
    PASSED_AWAY: 'bg-red-100 text-red-700',
  };

  get canEdit(): boolean { return this.auth.canEdit(); }

  filteredMembers = computed(() => {
    let list = this.members();
    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      list = list.filter(m =>
        m.firstName.toLowerCase().includes(term) ||
        m.lastName.toLowerCase().includes(term) ||
        m.militaryId.toLowerCase().includes(term)
      );
    }
    if (this.statusFilter())  list = list.filter(m => m.status === this.statusFilter());
    if (this.rankFilter())    list = list.filter(m => m.rank === this.rankFilter());
    if (this.commandFilter()) list = list.filter(m => String(m.command?.id) === this.commandFilter());
    return list;
  });

  ngOnInit() {
    this.load();
    this.commandService.getAll().subscribe(cmds => this.commands.set(buildCommandTree(cmds)));
  }

  load() {
    this.loading.set(true);
    this.memberService.getAll().subscribe({
      next: members => { this.members.set(members); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  clearFilters() {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.rankFilter.set('');
    this.commandFilter.set('');
  }

  delete(id: number) {
    if (!confirm('Delete this member? This cannot be undone.')) return;
    this.memberService.remove(id).subscribe(() => this.load());
  }
}
