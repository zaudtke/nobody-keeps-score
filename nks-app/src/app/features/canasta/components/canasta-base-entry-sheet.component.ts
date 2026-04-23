import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { getAvatarColor } from '../../game-setup/game-setup.constants';
import type { CanastaPlayerStanding } from '../canasta.model';

export type CanastaBaseMap = Record<string, number>;

@Component({
  selector: 'app-canasta-base-entry-sheet',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/50 z-40"
      (click)="dismiss.emit()"
      aria-hidden="true"
    ></div>

    <!-- Bottom sheet -->
    <div
      class="fixed bottom-0 left-0 right-0 z-50 rounded-t-[20px]
             bg-cream-50 dark:bg-ink-900
             shadow-[0_-4px_24px_rgba(0,0,0,0.18)]
             pb-[env(safe-area-inset-bottom)]"
      role="dialog"
      aria-label="Enter base scores for all players"
    >
      <!-- Handle -->
      <div class="flex justify-center pt-3 pb-1">
        <div class="w-9 h-1 rounded-full bg-ink-200 dark:bg-ink-700"></div>
      </div>

      <!-- Header -->
      <div
        class="flex items-start justify-between px-4 py-2
               border-b border-cream-200 dark:border-ink-800"
      >
        <div>
          <p class="font-display text-[1rem] font-bold text-ink-900 dark:text-ink-50 flex items-center gap-2 flex-wrap">
            Round {{ roundNumber() }} · Base
            <span
              class="text-[0.56rem] font-bold tracking-[0.08em] uppercase
                     px-1.5 py-[2px] rounded-[5px]
                     bg-[rgba(217,119,6,0.15)] text-amber-600 dark:text-amber-400
                     border border-[rgba(217,119,6,0.25)]"
            >
              Phase 1 of 2
            </span>
          </p>
          <p class="text-[0.65rem] text-ink-400 dark:text-ink-500 mt-[2px]">
            Enter base for all players · defaults to 0
          </p>
        </div>
      </div>

      <!-- Player rows -->
      @for (standing of standings(); track standing.playerId) {
        <div
          class="flex items-center gap-3 px-4 py-3
                 border-b border-cream-200/70 dark:border-ink-800/70"
        >
          <!-- Avatar -->
          <div
            class="w-[30px] h-[30px] rounded-full flex items-center justify-center
                   text-[0.75rem] font-bold font-display shrink-0"
            [style.background-color]="avatarColor(standing.order).bg"
            [style.color]="avatarColor(standing.order).text"
            aria-hidden="true"
          >
            {{ standing.name.charAt(0).toUpperCase() }}
          </div>

          <!-- Name + score -->
          <div class="flex-1 min-w-0">
            <p class="text-[0.88rem] font-semibold text-ink-900 dark:text-ink-100 truncate">
              {{ standing.name }}
            </p>
            <p class="text-[0.62rem] text-ink-400 dark:text-ink-500">
              Current · {{ standing.total | number }}
            </p>
          </div>

          <!-- Base input -->
          <div class="flex flex-col items-end gap-[2px] shrink-0">
            <span
              class="text-[0.52rem] font-bold tracking-[0.05em] uppercase text-amber-500 dark:text-amber-400"
            >
              Base
            </span>
            <input
              type="number"
              inputmode="numeric"
              min="0"
              placeholder="0"
              class="w-[72px] px-2.5 py-1.5 rounded-[8px] border-[1.5px] outline-none text-right
                     font-display text-[1.1rem] font-bold
                     bg-[rgba(217,119,6,0.08)] dark:bg-[rgba(217,119,6,0.08)]
                     text-amber-700 dark:text-amber-300
                     border-amber-600 dark:border-amber-800
                     focus:border-amber-500 dark:focus:border-amber-500
                     [appearance:textfield]
                     [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none"
              [value]="getBase(standing.playerId)"
              (input)="setBase(standing.playerId, $any($event.target).value)"
              [attr.aria-label]="'Base for ' + standing.name"
            />
          </div>
        </div>
      }

      <!-- Confirm -->
      <div class="px-4 py-3">
        <button
          type="button"
          (click)="confirm()"
          class="w-full py-3.5 px-4 rounded-[12px] text-[0.9rem] font-semibold font-display
                 text-white cursor-pointer outline-none
                 bg-felt-600
                 shadow-[0_4px_16px_rgba(26,127,75,0.25)]
                 focus-visible:ring-2 focus-visible:ring-felt-400"
        >
          Lock Bases &amp; Start Scores
        </button>
      </div>
    </div>
  `,
})
export class CanastaBaseEntrySheetComponent {
  standings = input.required<CanastaPlayerStanding[]>();
  roundNumber = input.required<number>();

  confirmed = output<CanastaBaseMap>();
  dismiss = output<void>();

  private theme = inject(ThemeService);
  private baseMap = signal<Record<string, string>>({});

  protected avatarColor(order: number) {
    return getAvatarColor(order, this.theme.isDark());
  }

  protected getBase(playerId: string): string {
    return this.baseMap()[playerId] ?? '';
  }

  protected setBase(playerId: string, val: string): void {
    this.baseMap.update((m) => ({ ...m, [playerId]: val.replace('-', '') }));
  }

  protected confirm(): void {
    const result: CanastaBaseMap = {};
    for (const standing of this.standings()) {
      const raw = this.baseMap()[standing.playerId] ?? '';
      const v = parseFloat(raw);
      result[standing.playerId] = isNaN(v) ? 0 : Math.max(0, Math.floor(v));
    }
    this.confirmed.emit(result);
  }
}
