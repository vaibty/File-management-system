import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { FileItemComponent } from '../file-item/file-item.component';
import { FileViewerComponent } from '../file-viewer/file-viewer.component';
import { FileApiService, FileItem } from '../services/file-api.service';
import { FileUtilsService } from '../services/file-utils.service';

/**
 * FileBrowserComponent - Main file browser component with routing support
 *
 * This component provides the main file browsing interface with navigation,
 * file operations, search functionality, and URL synchronization.
 */
@Component({
  selector: 'app-file-browser',
  standalone: true,
  imports: [CommonModule, FileItemComponent, FileViewerComponent],
  templateUrl: './file-browser.component.html',
  styleUrls: ['./file-browser.component.scss']
})
export class FileBrowserComponent implements OnInit, OnDestroy {
  /** Application title */
  readonly title = 'File Management System';

  /** Current directory path */
  currentPath = '/';

  /** Array of file and directory items */
  items: FileItem[] = [];

  /** Loading state indicator */
  loading = false;

  /** Error message if any */
  error: string | null = null;

  /** Current view mode (grid or list) */
  viewMode: 'grid' | 'list' = 'grid';

  /** Currently selected file for viewing */
  selectedFile: FileItem | null = null;

  /** Whether file viewer modal is open */
  showFileViewer = false;

  /** Search query for filtering items */
  searchQuery = '';

  /** Subject for component destruction cleanup */
  private destroy$ = new Subject<void>();

  constructor(
    private fileApiService: FileApiService,
    private fileUtilsService: FileUtilsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    // Listen to route changes
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const path = params['path'] ? '/' + params['path'] : '/';
        this.loadDirectory(path);
      });

    // Listen to navigation end events to update URL
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        // URL is already updated by router, just ensure we're in sync
        const path = this.route.snapshot.params['path'] ? '/' + this.route.snapshot.params['path'] : '/';
        if (path !== this.currentPath) {
          this.currentPath = path;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads directory contents and updates the current path
   * @param path - Directory path to load
   */
  loadDirectory(path: string): void {
    this.loading = true;
    this.error = null;
    this.currentPath = path;

    this.fileApiService.getDirectoryList(path).subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading directory:', error);
        this.error = 'Failed to load directory contents';
        this.loading = false;
      }
    });
  }

  /**
   * Navigates to a folder and updates the URL
   * @param folder - Folder to navigate to
   */
  navigateToFolder(folder: FileItem) {
    if (folder.isFolder) {
      const path = folder.path.substring(1); // Remove leading slash
      this.router.navigate(['/browse', path]);
    }
  }

  /**
   * Navigates to parent directory
   */
  navigateUp(): void {
    if (this.currentPath !== '/') {
      const parentPath = this.fileUtilsService.getParentPath(this.currentPath);
      const pathWithoutSlash = parentPath.substring(1);
      this.router.navigate(['/browse', pathWithoutSlash]);
    }
  }

  /**
   * Navigates to a specific path
   * @param path - Path to navigate to
   */
  navigateToPath(path: string) {
    const pathWithoutSlash = path.substring(1); // Remove leading slash
    this.router.navigate(['/browse', pathWithoutSlash]);
  }

  /**
   * Gets breadcrumb segments for navigation
   * @returns Array of breadcrumb segments
   */
  getBreadcrumbs(): string[] {
    return this.fileUtilsService.getBreadcrumbs(this.currentPath);
  }

  /**
   * Toggles between grid and list view modes
   */
  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  /**
   * Opens a file in the viewer modal
   * @param file - File to open
   */
  openFile(file: FileItem) {
    if (!file.isFolder) {
      this.selectedFile = file;
      this.showFileViewer = true;
    }
  }

  /**
   * Closes the file viewer modal
   */
  closeFileViewer() {
    this.showFileViewer = false;
    this.selectedFile = null;
  }

  /**
   * Downloads a file or folder
   * @param item - Item to download
   */
  downloadItem(item: FileItem): void {
    const link = document.createElement('a');
    link.href = this.fileApiService.getDownloadUrl(item.path);
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Gets filtered items based on search query
   * @returns Filtered array of items
   */
  getFilteredItems(): FileItem[] {
    return this.fileUtilsService.filterItems(this.items, this.searchQuery);
  }

  /**
   * Handles search input changes
   * @param event - Input event
   */
  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
  }
}
