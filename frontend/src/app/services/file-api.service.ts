import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

/**
 * File API Service - Handles all file-related API calls
 *
 * This service provides a clean interface for communicating with the backend
 * file management API, including directory listing, file content retrieval,
 * and download operations.
 */
@Injectable({
  providedIn: 'root'
})
export class FileApiService {
  /** Base URL for the file management API */
  private readonly API_BASE = 'http://localhost:3001/api';

  constructor(private httpService: HttpService) { }

  /**
   * Get list of files and directories in the specified path
   * @param path - Directory path to list (default: '/')
   * @returns Observable of file/directory items
   */
  getDirectoryList(path: string = '/'): Observable<FileItem[]> {
    const params = new HttpParams().set('path', path);
    return this.httpService.get<FileItem[]>(`${this.API_BASE}/list`, { params });
  }

  /**
   * Get content of a specific file
   * @param path - Path to the file
   * @returns Observable of file content as string
   */
  getFileContent(path: string): Observable<string> {
    const params = new HttpParams().set('path', path);
    return this.httpService.get<string>(`${this.API_BASE}/file`, {
      params,
      responseType: 'text'
    });
  }

  /**
   * Get download URL for a file or directory
   * @param path - Path to the item to download
   * @returns Download URL string
   */
  getDownloadUrl(path: string): string {
    return `${this.API_BASE}/download?path=${encodeURIComponent(path)}`;
  }

}

/**
 * File item interface representing files and directories
 */
export interface FileItem {
  /** Whether this item is a folder */
  isFolder: boolean;
  /** Name of the file or directory */
  name: string;
  /** Full path to the item */
  path: string;
  /** Size in bytes */
  size: number;
  /** Last modified timestamp */
  modified: string;
}
