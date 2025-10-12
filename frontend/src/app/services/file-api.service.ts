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

  /**
   * Download a file as a blob
   * @param path - Path to the file to download
   * @returns Observable of the file blob
   */
  downloadFile(path: string): Observable<Blob> {
    const params = new HttpParams().set('path', path);
    return this.httpService.downloadFile(`${this.API_BASE}/download`, { params });
  }

  /**
   * Upload a file
   * @param file - The file to upload
   * @param targetPath - The target path where the file should be uploaded
   * @returns Observable of the upload response
   */
  uploadFile(file: File, targetPath: string): Observable<any> {
    const additionalData = { targetPath };
    return this.httpService.uploadFile(`${this.API_BASE}/upload`, file, additionalData);
  }

  /**
   * Create a new directory
   * @param path - Path where the directory should be created
   * @param name - Name of the new directory
   * @returns Observable of the creation response
   */
  createDirectory(path: string, name: string): Observable<any> {
    const body = { path, name };
    return this.httpService.post(`${this.API_BASE}/directory`, body);
  }

  /**
   * Delete a file or directory
   * @param path - Path to the file or directory to delete
   * @returns Observable of the deletion response
   */
  deleteFile(path: string): Observable<any> {
    const params = new HttpParams().set('path', path);
    return this.httpService.delete(`${this.API_BASE}/file`, { params });
  }

  /**
   * Rename a file or directory
   * @param oldPath - Current path of the file or directory
   * @param newName - New name for the file or directory
   * @returns Observable of the rename response
   */
  renameFile(oldPath: string, newName: string): Observable<any> {
    const body = { oldPath, newName };
    return this.httpService.put(`${this.API_BASE}/file/rename`, body);
  }

  /**
   * Move a file or directory
   * @param sourcePath - Current path of the file or directory
   * @param targetPath - Target path where the item should be moved
   * @returns Observable of the move response
   */
  moveFile(sourcePath: string, targetPath: string): Observable<any> {
    const body = { sourcePath, targetPath };
    return this.httpService.put(`${this.API_BASE}/file/move`, body);
  }

  /**
   * Copy a file or directory
   * @param sourcePath - Path of the file or directory to copy
   * @param targetPath - Target path where the item should be copied
   * @returns Observable of the copy response
   */
  copyFile(sourcePath: string, targetPath: string): Observable<any> {
    const body = { sourcePath, targetPath };
    return this.httpService.post(`${this.API_BASE}/file/copy`, body);
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
