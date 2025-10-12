import { Injectable } from '@angular/core';

/**
 * Performance Service - Monitors and optimizes application performance
 *
 * This service provides performance monitoring, metrics collection,
 * and optimization utilities for the application.
 */
@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring() {
    if (typeof PerformanceObserver !== 'undefined') {
      // Monitor navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordMetric('page_load_time', entry.duration);
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Monitor resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordMetric(`resource_${resourceEntry.name}`, resourceEntry.duration);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    }
  }

  /**
   * Record a performance metric
   * @param name - Metric name
   * @param value - Metric value
   */
  recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
  }

  /**
   * Get a performance metric
   * @param name - Metric name
   * @returns Metric value or undefined
   */
  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get all performance metrics
   * @returns Map of all metrics
   */
  getAllMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  /**
   * Start a performance measurement
   * @param name - Measurement name
   * @returns Performance mark name
   */
  startMeasurement(name: string): string {
    const markName = `${name}_start`;
    performance.mark(markName);
    return markName;
  }

  /**
   * End a performance measurement
   * @param name - Measurement name
   * @param startMark - Start mark name
   * @returns Duration in milliseconds
   */
  endMeasurement(name: string, startMark: string): number {
    const endMark = `${name}_end`;
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);

    const measure = performance.getEntriesByName(name)[0];
    const duration = measure ? measure.duration : 0;

    this.recordMetric(name, duration);
    return duration;
  }

  /**
   * Measure function execution time
   * @param name - Measurement name
   * @param fn - Function to measure
   * @returns Function result
   */
  measureFunction<T>(name: string, fn: () => T): T {
    const startMark = this.startMeasurement(name);
    const result = fn();
    this.endMeasurement(name, startMark);
    return result;
  }

  /**
   * Get memory usage information
   * @returns Memory usage object or null
   */
  getMemoryUsage(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  /**
   * Check if the application is running slowly
   * @returns True if performance is poor
   */
  isPerformancePoor(): boolean {
    const pageLoadTime = this.getMetric('page_load_time');
    const memoryUsage = this.getMemoryUsage();

    return (
      (pageLoadTime && pageLoadTime > 3000) || // Page load > 3 seconds
      (memoryUsage && memoryUsage.usedJSHeapSize > 50 * 1024 * 1024) // Memory > 50MB
    );
  }

  /**
   * Get performance recommendations
   * @returns Array of performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const pageLoadTime = this.getMetric('page_load_time');
    const memoryUsage = this.getMemoryUsage();

    if (pageLoadTime && pageLoadTime > 3000) {
      recommendations.push('Consider implementing lazy loading for components');
      recommendations.push('Optimize bundle size and enable tree shaking');
    }

    if (memoryUsage && memoryUsage.usedJSHeapSize > 50 * 1024 * 1024) {
      recommendations.push('Check for memory leaks in components');
      recommendations.push('Implement proper cleanup in ngOnDestroy');
    }

    return recommendations;
  }

  /**
   * Cleanup performance observers
   */
  ngOnDestroy() {
    this.observers.forEach(observer => observer.disconnect());
  }
}
