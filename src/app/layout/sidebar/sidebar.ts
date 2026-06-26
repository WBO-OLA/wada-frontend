import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { CommandService } from '../../features/personnel/services/command.service';
import { CommandSelectorService } from '../../core/services/command-selector.service';
import { LayoutService } from '../../core/services/layout.service';
import { CommandWithDepth } from '../../core/models/command.model';
import { buildCommandTree } from '../../core/utils/command-tree';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  protected auth = inject(AuthService);
  private commandService = inject(CommandService);
  protected commandSelector = inject(CommandSelectorService);
  protected layout = inject(LayoutService);
  private router = inject(Router);

  commandTree: CommandWithDepth[] = [];
  commandSelectorOpen = false;

  get isAdmin(): boolean { return this.auth.isAdmin(); }

  ngOnInit(): void {
    this.commandService.getAll().subscribe(commands => {
      this.commandTree = buildCommandTree(commands);
    });
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.layout.closeSidebar());
  }

  selectCommand(cmd: CommandWithDepth | null): void {
    this.commandSelector.select(cmd);
    this.commandSelectorOpen = false;
  }

  toggleCommandSelector(): void {
    this.commandSelectorOpen = !this.commandSelectorOpen;
  }
}
