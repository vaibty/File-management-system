import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FileItem } from '../services/file-api.service';
import { FileUtilsService } from '../services/file-utils.service';

/**
 * FileItemComponent - Displays individual file or directory items
 *
 * This component renders file and directory items in both grid and list views,
 * providing click handlers for navigation and file operations.
 */
@Component({
  selector: 'app-file-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-item.component.html',
  styleUrls: ['./file-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileItemComponent {
  /** File or directory item to display */
  @Input() item!: FileItem;

  /** Current view mode (grid or list) */
  @Input() viewMode: 'grid' | 'list' = 'grid';

  /** Event emitted when navigating to a folder */
  @Output() navigate = new EventEmitter<FileItem>();

  /** Event emitted when opening a file */
  @Output() openFile = new EventEmitter<FileItem>();

  /** Event emitted when downloading an item */
  @Output() download = new EventEmitter<FileItem>();

  constructor(private fileUtilsService: FileUtilsService) { }

  /**
   * Handles item click - navigates to folder or opens file
   */
  onItemClick(): void {
    if (this.item.isFolder) {
      this.navigate.emit(this.item);
    } else {
      this.openFile.emit(this.item);
    }
  }

  /**
   * Handles download button click
   * @param event - Click event
   */
  onDownload(event: Event): void {
    event.stopPropagation();
    this.download.emit(this.item);
  }

  /**
   * Formats file size for display
   * @param bytes - Size in bytes
   * @returns Formatted size string
   */
  formatFileSize(bytes: number): string {
    return this.fileUtilsService.formatFileSize(bytes);
  }

  /**
   * Formats date for display
   * @param dateString - ISO date string
   * @returns Formatted date string
   */
  formatDate(dateString: string): string {
    return this.fileUtilsService.formatDate(dateString);
  }

  /**
   * Gets appropriate icon for the file type
   * @returns Emoji icon string
   */
  getFileIcon(): string {
    return this.fileUtilsService.getFileIcon(this.item.name, this.item.isFolder);
  }
}
