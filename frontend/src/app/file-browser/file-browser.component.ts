import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { FileItem, FileItemComponent } from '../file-item/file-item.component';
import { FileViewerComponent } from '../file-viewer/file-viewer.component';

/**
 * FileBrowserComponent - Main file browser component with routing support
 * Handles navigation, file operations, and URL synchronization
 */
@Component({
  selector: 'app-file-browser',
  standalone: true,
  imports: [CommonModule, FileItemComponent, FileViewerComponent],
  templateUrl: './file-browser.component.html',
  styleUrls: ['./file-browser.component.scss']
})
export class FileBrowserComponent implements OnInit, OnDestroy {
  title = 'Test Report Dashboard';
  currentPath = '/';
  items: FileItem[] = [];
  loading = false;
  error: string | null = null;
  viewMode: 'grid' | 'list' = 'grid';
  selectedFile: FileItem | null = null;
  showFileViewer = false;
  searchQuery = '';

  private readonly API_BASE = 'http://localhost:3001/api';
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
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
  loadDirectory(path: string) {
    this.loading = true;
    this.error = null;
    this.currentPath = path;

    this.http.get<FileItem[]>(`${this.API_BASE}/list`, {
      params: { path }
    }).subscribe({
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
  navigateUp() {
    if (this.currentPath !== '/') {
      const pathSegments = this.currentPath.split('/').filter(segment => segment);
      pathSegments.pop(); // Remove last segment
      const parentPath = pathSegments.length > 0 ? pathSegments.join('/') : '';
      this.router.navigate(['/browse', parentPath]);
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
    if (this.currentPath === '/') {
      return ['/'];
    }
    return this.currentPath.split('/').filter(segment => segment);
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
  downloadItem(item: FileItem) {
    const link = document.createElement('a');
    link.href = `${this.API_BASE}/download?path=${encodeURIComponent(item.path)}`;
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
    if (!this.searchQuery.trim()) {
      return this.items;
    }

    const query = this.searchQuery.toLowerCase();
    return this.items.filter(item =>
      item.name.toLowerCase().includes(query)
    );
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
