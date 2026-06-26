import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MemberService } from '../../../personnel/services/member.service';
import { ItemService } from '../../../inventory/services/item.service';
import { CommandSelectorService } from '../../../../core/services/command-selector.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  totalMembers = signal(0);
  activeMembers = signal(0);
  injuredMembers = signal(0);
  totalItems = signal(0);
  lowStockItems = signal(0);
  activeCommandName = signal<string | null>(null);

  private sub?: Subscription;

  private memberService = inject(MemberService);
  private itemService = inject(ItemService);
  protected commandSelector = inject(CommandSelectorService);

  ngOnInit() {
    this.sub = this.commandSelector.descendantIdsChange.subscribe(() => {
      this.loadData();
    });
    this.loadData();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private loadData() {
    const commandIdsParam = this.commandSelector.getCommandIdsParam();
    this.activeCommandName.set(this.commandSelector.selected?.name ?? null);

    const memberParams = commandIdsParam ? { commandIds: commandIdsParam } : undefined;
    this.memberService.getAll(memberParams).subscribe(members => {
      this.totalMembers.set(members.length);
      this.activeMembers.set(members.filter(m => m.status === 'ACTIVE').length);
      this.injuredMembers.set(members.filter(m => m.status === 'INJURED').length);
    });
    const itemParams = commandIdsParam ? { commandIds: commandIdsParam } : undefined;
    this.itemService.getAll(itemParams).subscribe(items => this.totalItems.set(items.length));
    this.itemService.getLowStock().subscribe(items => this.lowStockItems.set(items.length));
  }
}
