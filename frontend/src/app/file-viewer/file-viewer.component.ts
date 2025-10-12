import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileApiService, FileItem } from '../services/file-api.service';
import { FileUtilsService } from '../services/file-utils.service';

/**
 * FileViewerComponent - Modal component for viewing file contents
 *
 * This component displays file contents in a modal dialog with syntax highlighting
 * and formatting for different file types.
 */
@Component({
  selector: 'app-file-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileViewerComponent implements OnInit {
  /** File item to display */
  @Input() file!: FileItem;

  /** Event emitted when closing the viewer */
  @Output() close = new EventEmitter<void>();

  /** Event emitted when downloading the file */
  @Output() download = new EventEmitter<FileItem>();

  /** File content to display */
  content: string = '';

  /** Loading state indicator */
  loading = false;

  /** Error message if any */
  error: string | null = null;

  constructor(
    private fileApiService: FileApiService,
    private fileUtilsService: FileUtilsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadFileContent();
  }

  /**
   * Loads file content from the API
   */
  loadFileContent(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.fileApiService.getFileContent(this.file.path).subscribe({
      next: (content) => {
        this.content = content;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading file content:', error);
        this.error = 'Failed to load file content';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Handles close button click
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Handles download button click
   */
  onDownload(): void {
    this.download.emit(this.file);
  }

  /**
   * Gets file type based on extension
   * @returns File type string
   */
  getFileType(): string {
    const extension = this.file.name.split('.').pop()?.toLowerCase();
    return extension || 'text';
  }

  /**
   * Checks if file is a text file that can be displayed
   * @returns True if file is a text file
   */
  isTextFile(): boolean {
    const textExtensions = [
      'txt', 'log', 'json', 'js', 'ts', 'html', 'css', 'scss',
      'md', 'xml', 'yaml', 'yml', 'ini', 'conf', 'csv'
    ];
    const extension = this.file.name.split('.').pop()?.toLowerCase();
    return textExtensions.includes(extension || '');
  }

  /**
   * Formats content for display (e.g., JSON pretty-printing)
   * @returns Formatted content string
   */
  formatContent(): string {
    if (this.getFileType() === 'json') {
      try {
        const parsed = JSON.parse(this.content);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return this.content;
      }
    }
    return this.content;
  }

  /**
   * Formats file size for display
   * @param bytes - Size in bytes
   * @returns Formatted size string
   */
  formatFileSize(bytes: number): string {
    return this.fileUtilsService.formatFileSize(bytes);
  }
}
