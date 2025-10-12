import { Injectable } from '@angular/core';

/**
 * Memoization utility for caching function results
 */
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * File Utils Service - Utility functions for file operations
 *
 * This service provides common utility functions for file handling,
 * formatting, and display operations.
 */
@Injectable({
  providedIn: 'root'
})
export class FileUtilsService {

  /**
   * Format file size in bytes to human-readable format
   * @param bytes - Size in bytes
   * @returns Formatted size string (e.g., "1.5 MB")
   */
  formatFileSize = memoize((bytes: number): string => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  });

  /**
   * Format date string to localized date and time
   * @param dateString - ISO date string
   * @returns Formatted date and time string
   */
  formatDate = memoize((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  /**
   * Get appropriate icon for file type
   * @param fileName - Name of the file
   * @param isFolder - Whether the item is a folder
   * @returns Emoji icon string
   */
  getFileIcon = memoize((fileName: string, isFolder: boolean): string => {
    if (isFolder) {
      return '📁';
    }

    const extension = fileName.split('.').pop()?.toLowerCase();
    return this.getIconByExtension(extension);
  });

  /**
   * Get icon based on file extension
   * @private
   * @param extension - File extension
   * @returns Emoji icon string
   */
  private getIconByExtension(extension?: string): string {
    const iconMap: Record<string, string> = {
      // Text files
      'log': '📄',
      'json': '📋',
      'txt': '📝',
      'md': '📖',

      // Code files
      'js': '⚡',
      'ts': '⚡',
      'html': '🌐',
      'css': '🎨',
      'scss': '🎨',

      // Media files
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',

      // Documents
      'pdf': '📕',

      // Archives
      'zip': '📦',
      'tar': '📦',
      'gz': '📦',

      // Config files
      'yaml': '⚙️',
      'yml': '⚙️',
      'xml': '⚙️',
      'ini': '⚙️',
      'conf': '⚙️'
    };

    return iconMap[extension || ''] || '📄';
  }

  /**
   * Filter items based on search query
   * @param items - Array of file items
   * @param query - Search query string
   * @returns Filtered array of items
   */
  filterItems = memoize((items: any[], query: string): any[] => {
    if (!query.trim()) {
      return items;
    }

    const searchQuery = query.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery)
    );
  });

  /**
   * Navigate to parent directory path
   * @param currentPath - Current directory path
   * @returns Parent directory path
   */
  getParentPath = memoize((currentPath: string): string => {
    if (currentPath === '/') {
      return '/';
    }

    const pathSegments = currentPath.split('/').filter(segment => segment);
    pathSegments.pop(); // Remove last segment
    return pathSegments.length > 0 ? '/' + pathSegments.join('/') : '/';
  });

  /**
   * Get breadcrumb segments from path
   * @param path - Directory path
   * @returns Array of breadcrumb segments
   */
  getBreadcrumbs = memoize((path: string): string[] => {
    if (path === '/') {
      return ['/'];
    }
    return path.split('/').filter(segment => segment);
  });
}
