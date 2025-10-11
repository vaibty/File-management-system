import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileItem } from '../file-item/file-item.component';

@Component({
  selector: 'app-file-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit {
  @Input() file!: FileItem;
  @Output() close = new EventEmitter<void>();
  @Output() download = new EventEmitter<FileItem>();

  content: string = '';
  loading = false;
  error: string | null = null;

  private readonly API_BASE = 'http://localhost:3001/api';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadFileContent();
  }

  loadFileContent() {
    this.loading = true;
    this.error = null;

    this.http.get(`${this.API_BASE}/file`, {
      params: { path: this.file.path },
      responseType: 'text'
    }).subscribe({
      next: (content) => {
        this.content = content;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading file content:', error);
        this.error = 'Failed to load file content';
        this.loading = false;
      }
    });
  }

  onClose() {
    this.close.emit();
  }

  onDownload() {
    this.download.emit(this.file);
  }

  getFileType(): string {
    const extension = this.file.name.split('.').pop()?.toLowerCase();
    return extension || 'text';
  }

  isTextFile(): boolean {
    const textExtensions = ['txt', 'log', 'json', 'js', 'ts', 'html', 'css', 'scss', 'md', 'xml', 'yaml', 'yml'];
    const extension = this.file.name.split('.').pop()?.toLowerCase();
    return textExtensions.includes(extension || '');
  }

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

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
