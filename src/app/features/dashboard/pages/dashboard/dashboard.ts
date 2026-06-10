import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MemberService } from '../../../personnel/services/member.service';
import { ItemService } from '../../../inventory/services/item.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  totalMembers = signal(0);
  activeMembers = signal(0);
  injuredMembers = signal(0);
  totalItems = signal(0);
  lowStockItems = signal(0);

  constructor(
    private memberService: MemberService,
    private itemService: ItemService,
  ) {}

  ngOnInit() {
    this.memberService.getAll().subscribe(members => {
      this.totalMembers.set(members.length);
      this.activeMembers.set(members.filter(m => m.status === 'ACTIVE').length);
      this.injuredMembers.set(members.filter(m => m.status === 'INJURED').length);
    });
    this.itemService.getAll().subscribe(items => this.totalItems.set(items.length));
    this.itemService.getLowStock().subscribe(items => this.lowStockItems.set(items.length));
  }
}
