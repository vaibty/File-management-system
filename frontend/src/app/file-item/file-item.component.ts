import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface FileItem {
  isFolder: boolean;
  name: string;
  path: string;
  size: number;
  modified: string;
}

@Component({
  selector: 'app-file-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-item.component.html',
  styleUrls: ['./file-item.component.scss']
})
export class FileItemComponent {
  @Input() item!: FileItem;
  @Input() viewMode: 'grid' | 'list' = 'grid';
  @Output() navigate = new EventEmitter<FileItem>();
  @Output() openFile = new EventEmitter<FileItem>();
  @Output() download = new EventEmitter<FileItem>();

  onItemClick() {
    if (this.item.isFolder) {
      this.navigate.emit(this.item);
    } else {
      this.openFile.emit(this.item);
    }
  }

  onDownload(event: Event) {
    event.stopPropagation();
    this.download.emit(this.item);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getFileIcon(): string {
    if (this.item.isFolder) {
      return '📁';
    }

    const extension = this.item.name.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'log':
        return '📄';
      case 'json':
        return '📋';
      case 'txt':
        return '📝';
      case 'md':
        return '📖';
      case 'js':
      case 'ts':
        return '⚡';
      case 'html':
        return '🌐';
      case 'css':
      case 'scss':
        return '🎨';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return '🖼️';
      case 'pdf':
        return '📕';
      case 'zip':
      case 'tar':
      case 'gz':
        return '📦';
      default:
        return '📄';
    }
  }
}
