import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';

/**
 * Generic HTTP Service - Provides standardized HTTP methods
 *
 * This service wraps Angular's HttpClient with consistent error handling,
 * response transformation, and common HTTP operations for the application.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /** Cache for GET requests */
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  /** Default cache TTL in milliseconds (5 minutes) */
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000;

  constructor(private http: HttpClient) { }

  /**
   * Perform a GET request with caching
   * @param url - The URL to make the request to
   * @param options - Optional HTTP options (headers, params, etc.)
   * @param useCache - Whether to use caching (default: true)
   * @param cacheTtl - Cache TTL in milliseconds (default: 5 minutes)
   * @returns Observable of the response
   */
  get<T>(url: string, options?: HttpOptions, useCache: boolean = true, cacheTtl?: number): Observable<T> {
    const cacheKey = this.getCacheKey(url, options);

    // Check cache first
    if (useCache && this.isCacheValid(cacheKey)) {
      return of(this.cache.get(cacheKey)!.data);
    }

    const httpOptions = this.buildHttpOptions(options);
    return this.http.get<T>(url, httpOptions).pipe(
      tap(data => {
        // Cache the response
        if (useCache) {
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            ttl: cacheTtl || this.DEFAULT_CACHE_TTL
          });
        }
      }),
      shareReplay(1), // Share the observable to prevent duplicate requests
      catchError(this.handleError)
    ) as Observable<T>;
  }

  /**
   * Perform a POST request
   * @param url - The URL to make the request to
   * @param body - The request body
   * @param options - Optional HTTP options (headers, params, etc.)
   * @returns Observable of the response
   */
  post<T>(url: string, body: any, options?: HttpOptions): Observable<T> {
    const httpOptions = this.buildHttpOptions(options);
    return this.http.post<T>(url, body, httpOptions).pipe(
      catchError(this.handleError)
    ) as Observable<T>;
  }

  /**
   * Perform a PUT request
   * @param url - The URL to make the request to
   * @param body - The request body
   * @param options - Optional HTTP options (headers, params, etc.)
   * @returns Observable of the response
   */
  put<T>(url: string, body: any, options?: HttpOptions): Observable<T> {
    const httpOptions = this.buildHttpOptions(options);
    return this.http.put<T>(url, body, httpOptions).pipe(
      catchError(this.handleError)
    ) as Observable<T>;
  }

  /**
   * Perform a PATCH request
   * @param url - The URL to make the request to
   * @param body - The request body
   * @param options - Optional HTTP options (headers, params, etc.)
   * @returns Observable of the response
   */
  patch<T>(url: string, body: any, options?: HttpOptions): Observable<T> {
    const httpOptions = this.buildHttpOptions(options);
    return this.http.patch<T>(url, body, httpOptions).pipe(
      catchError(this.handleError)
    ) as Observable<T>;
  }

  /**
   * Perform a DELETE request
   * @param url - The URL to make the request to
   * @param options - Optional HTTP options (headers, params, etc.)
   * @returns Observable of the response
   */
  delete<T>(url: string, options?: HttpOptions): Observable<T> {
    const httpOptions = this.buildHttpOptions(options);
    return this.http.delete<T>(url, httpOptions).pipe(
      catchError(this.handleError)
    ) as Observable<T>;
  }

  /**
   * Perform a HEAD request
   * @param url - The URL to make the request to
   * @param options - Optional HTTP options (headers, params, etc.)
   * @returns Observable of the response headers
   */
  head(url: string, options?: HttpOptions): Observable<any> {
    const httpOptions = this.buildHttpOptions(options);
    return this.http.head(url, httpOptions).pipe(
      catchError(this.handleError)
    ) as Observable<any>;
  }

  /**
   * Perform an OPTIONS request
   * @param url - The URL to make the request to
   * @param options - Optional HTTP options (headers, params, etc.)
   * @returns Observable of the response
   */
  options<T>(url: string, options?: HttpOptions): Observable<T> {
    const httpOptions = this.buildHttpOptions(options);
    return this.http.options<T>(url, httpOptions).pipe(
      catchError(this.handleError)
    ) as Observable<T>;
  }

  /**
   * Download a file as a blob
   * @param url - The URL to download from
   * @param options - Optional HTTP options
   * @returns Observable of the blob
   */
  downloadFile(url: string, options?: HttpOptions): Observable<Blob> {
    const httpOptions = this.buildHttpOptions(options);
    httpOptions.responseType = 'blob';
    return this.http.get<Blob>(url, httpOptions).pipe(
      catchError(this.handleError)
    ) as unknown as Observable<Blob>;
  }

  /**
   * Upload a file
   * @param url - The URL to upload to
   * @param file - The file to upload
   * @param additionalData - Additional form data to include
   * @param options - Optional HTTP options
   * @returns Observable of the response
   */
  uploadFile<T>(url: string, file: File, additionalData?: any, options?: HttpOptions): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const httpOptions = this.buildHttpOptions(options);
    httpOptions.headers = httpOptions.headers?.delete('Content-Type') || new HttpHeaders();

    return this.http.post<T>(url, formData, httpOptions).pipe(
      catchError(this.handleError)
    ) as Observable<T>;
  }

  /**
   * Build HTTP options from custom options
   * @param options - Custom HTTP options
   * @returns Angular HTTP options
   */
  private buildHttpOptions(options?: HttpOptions): any {
    const httpOptions: any = {
      headers: this.defaultHeaders
    };

    if (options) {
      if (options.headers) {
        httpOptions.headers = options.headers;
      }
      if (options.params) {
        httpOptions.params = options.params;
      }
      if (options.responseType) {
        httpOptions.responseType = options.responseType;
      }
      if (options.observe) {
        httpOptions.observe = options.observe;
      }
    }

    return httpOptions;
  }

  /**
   * Generate cache key from URL and options
   * @param url - Request URL
   * @param options - HTTP options
   * @returns Cache key string
   */
  private getCacheKey(url: string, options?: HttpOptions): string {
    const params = options?.params ? options.params.toString() : '';
    return `${url}?${params}`;
  }

  /**
   * Check if cache entry is valid
   * @param cacheKey - Cache key
   * @returns True if cache is valid
   */
  private isCacheValid(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;

    const now = Date.now();
    return (now - cached.timestamp) < cached.ttl;
  }

  /**
   * Clear cache entries
   * @param pattern - Optional pattern to match cache keys
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Handle HTTP errors
   * @param error - The HTTP error response
   * @returns Observable that throws the error
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    }

    console.error('HTTP Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  };
}

/**
 * Interface for HTTP options
 */
export interface HttpOptions {
  headers?: HttpHeaders;
  params?: HttpParams;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  observe?: 'body' | 'events' | 'response';
}