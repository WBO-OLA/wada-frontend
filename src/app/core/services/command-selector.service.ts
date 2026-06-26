import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { CommandWithDepth } from '../models/command.model';
import { CommandService } from '../../features/personnel/services/command.service';

@Injectable({ providedIn: 'root' })
export class CommandSelectorService {
  private selectedCommand$ = new BehaviorSubject<CommandWithDepth | null>(null);
  private descendantIds$ = new BehaviorSubject<number[] | null>(null);

  constructor(private commandService: CommandService) {}

  get selected(): CommandWithDepth | null {
    return this.selectedCommand$.getValue();
  }

  get selectedChange(): Observable<CommandWithDepth | null> {
    return this.selectedCommand$.asObservable();
  }

  get descendantIds(): number[] | null {
    return this.descendantIds$.getValue();
  }

  get descendantIdsChange(): Observable<number[] | null> {
    return this.descendantIds$.asObservable();
  }

  select(command: CommandWithDepth | null): void {
    this.selectedCommand$.next(command);
    if (command?.id == null) {
      this.descendantIds$.next(null);
      return;
    }
    this.commandService.getDescendantIds(command.id).subscribe(ids => {
      this.descendantIds$.next(ids);
    });
  }

  clear(): void {
    this.selectedCommand$.next(null);
    this.descendantIds$.next(null);
  }

  /** Returns comma-separated commandIds string for query params, or null if no command selected. */
  getCommandIdsParam(): string | null {
    const ids = this.descendantIds$.getValue();
    return ids && ids.length > 0 ? ids.join(',') : null;
  }
}
