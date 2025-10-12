import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Virtual Scroll Component - Efficiently renders large lists
 *
 * This component provides virtual scrolling for large datasets to improve performance
 * by only rendering visible items in the viewport.
 */
@Component({
  selector: 'app-virtual-scroll',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="virtual-scroll-container"
         [style.height]="containerHeight + 'px'"
         (scroll)="onScroll($event)">
      <div class="virtual-scroll-content"
           [style.height]="totalHeight + 'px'"
           [style.transform]="'translateY(' + offsetY + 'px)'">
        <div class="virtual-scroll-items">
          <ng-container *ngFor="let item of visibleItems; trackBy: trackByFn; let i = index">
            <ng-content [ngTemplateOutlet]="itemTemplate"
                       [ngTemplateOutletContext]="{ $implicit: item, index: startIndex + i }">
            </ng-content>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .virtual-scroll-container {
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
    }

    .virtual-scroll-content {
      position: relative;
    }

    .virtual-scroll-items {
      position: relative;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualScrollComponent<T> implements OnInit, OnDestroy {
  /** Array of items to display */
  @Input() items: T[] = [];

  /** Height of each item in pixels */
  @Input() itemHeight: number = 50;

  /** Height of the container in pixels */
  @Input() containerHeight: number = 400;

  /** Number of items to render outside the viewport (buffer) */
  @Input() bufferSize: number = 5;

  /** Template for rendering each item */
  @Input() itemTemplate: any;

  /** TrackBy function for performance */
  @Input() trackByFn: (index: number, item: T) => any = (index, item) => index;

  /** Total height of all items */
  totalHeight = 0;

  /** Vertical offset for positioning */
  offsetY = 0;

  /** Index of the first visible item */
  startIndex = 0;

  /** Number of visible items */
  visibleCount = 0;

  /** Currently visible items */
  visibleItems: T[] = [];

  /** Subject for component destruction cleanup */
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.calculateDimensions();
    this.updateVisibleItems();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle scroll events
   */
  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;

    this.startIndex = Math.floor(scrollTop / this.itemHeight);
    this.offsetY = this.startIndex * this.itemHeight;

    this.updateVisibleItems();
    this.cdr.markForCheck();
  }

  /**
   * Calculate total dimensions
   */
  private calculateDimensions() {
    this.totalHeight = this.items.length * this.itemHeight;
    this.visibleCount = Math.ceil(this.containerHeight / this.itemHeight) + (this.bufferSize * 2);
  }

  /**
   * Update visible items array
   */
  private updateVisibleItems() {
    const endIndex = Math.min(this.startIndex + this.visibleCount, this.items.length);
    const start = Math.max(0, this.startIndex - this.bufferSize);
    const end = Math.min(this.items.length, endIndex + this.bufferSize);

    this.visibleItems = this.items.slice(start, end);
    this.startIndex = start;
  }
}
