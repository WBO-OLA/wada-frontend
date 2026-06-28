import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { MemberService } from '../../../personnel/services/member.service';
import { ItemService } from '../../../inventory/services/item.service';
import { FinanceService } from '../../../finance/services/finance.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CommandSelectorService } from '../../../../core/services/command-selector.service';
import { Member } from '../../../../core/models/member.model';
import { Budget, Expense, Income } from '../../../../core/models/finance.model';
import { Item } from '../../../../core/models/item.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DecimalPipe, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {

  // Personnel
  members = signal<Member[]>([]);
  totalMembers = computed(() => this.members().length);
  activeMembers = computed(() => this.members().filter(m => m.status === 'ACTIVE').length);
  injuredMembers = computed(() => this.members().filter(m => m.status === 'INJURED').length);
  retiredMembers = computed(() => this.members().filter(m => m.status === 'RETIRED' || m.status === 'PASSED_AWAY').length);

  // Inventory
  items = signal<Item[]>([]);
  totalItems = computed(() => this.items().length);
  lowStockItems = signal(0);

  // Finance
  budgets = signal<Budget[]>([]);
  expenses = signal<Expense[]>([]);
  incomes = signal<Income[]>([]);
  activeBudgets = computed(() => this.budgets().filter(b => b.status === 'ACTIVE').length);
  pendingExpenses = computed(() => this.expenses().filter(e => e.status === 'PENDING').length);
  totalIncome = computed(() => this.incomes().reduce((s, i) => s + (i.amount ?? 0), 0));
  totalExpensesApproved = computed(() =>
    this.expenses().filter(e => e.status === 'APPROVED').reduce((s, e) => s + (e.amount ?? 0), 0)
  );

  // Scope
  scopeName = signal<string | null>(null);
  loading = signal(true);

  private sub?: Subscription;
  private auth = inject(AuthService);
  private memberService = inject(MemberService);
  private itemService = inject(ItemService);
  private financeService = inject(FinanceService);
  protected commandSelector = inject(CommandSelectorService);

  get isGlobal(): boolean { return this.auth.isGlobal(); }
  get currentRole(): string { return this.auth.getRole(); }
  get currentUsername(): string { return this.auth.getUser()?.username ?? ''; }

  ngOnInit() {
    this.sub = this.commandSelector.descendantIdsChange.subscribe(() => this.loadData());
    this.loadData();
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  private loadData() {
    this.loading.set(true);
    const commandIdsParam = this.commandSelector.getCommandIdsParam();
    this.scopeName.set(this.commandSelector.selected?.name ?? null);
    const cmdId = this.auth.getCommandId() ?? undefined;

    const memberParams = commandIdsParam ? { commandIds: commandIdsParam } : undefined;
    this.memberService.getAll(memberParams).subscribe(list => this.members.set(list));

    const itemParams = commandIdsParam ? { commandIds: commandIdsParam } : undefined;
    this.itemService.getAll(itemParams).subscribe(list => this.items.set(list));
    this.itemService.getLowStock().subscribe(list => this.lowStockItems.set(list.length));

    this.financeService.getBudgets(undefined, cmdId).subscribe(list => this.budgets.set(list));
    this.financeService.getExpenses(undefined, cmdId).subscribe(list => this.expenses.set(list));
    this.financeService.getIncomes(cmdId).subscribe(list => {
      this.incomes.set(list);
      this.loading.set(false);
    });
  }

  formatCurrency(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString();
  }
}
