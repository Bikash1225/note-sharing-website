/**
 * Performance Monitoring for Clerk Authentication
 * 
 * This module provides performance monitoring and analytics
 * for authentication flows and user interactions.
 */

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  userId?: string
  metadata?: Record<string, any>
}

interface AuthEvent {
  event: 'sign-in' | 'sign-up' | 'sign-out' | 'profile-update' | 'error'
  userId?: string
  duration?: number
  success: boolean
  error?: string
  metadata?: Record<string, any>
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private authEvents: AuthEvent[] = []
  private isEnabled: boolean = process.env.NODE_ENV === 'production'

  constructor() {
    if (typeof window !== 'undefined' && this.isEnabled) {
      this.initializeWebVitals()
      this.initializeAuthMonitoring()
    }
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  private initializeWebVitals() {
    // Monitor Largest Contentful Paint (LCP)
    this.observePerformanceEntry('largest-contentful-paint', (entry) => {
      this.recordMetric('LCP', entry.startTime, {
        element: entry.element?.tagName,
        url: entry.url
      })
    })

    // Monitor First Input Delay (FID)
    this.observePerformanceEntry('first-input', (entry) => {
      this.recordMetric('FID', entry.processingStart - entry.startTime, {
        eventType: entry.name
      })
    })

    // Monitor Cumulative Layout Shift (CLS)
    this.observePerformanceEntry('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        this.recordMetric('CLS', entry.value, {
          sources: entry.sources?.length
        })
      }
    })
  }

  /**
   * Initialize authentication-specific monitoring
   */
  private initializeAuthMonitoring() {
    // Monitor page load times for auth pages
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (window.location.pathname.includes('/auth/')) {
          this.recordMetric('auth-page-load', navigation.loadEventEnd - navigation.fetchStart, {
            page: window.location.pathname,
            type: navigation.type
          })
        }
      })
    }
  }

  /**
   * Observe performance entries of a specific type
   */
  private observePerformanceEntry(type: string, callback: (entry: any) => void) {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback)
      })
      
      try {
        observer.observe({ type, buffered: true })
      } catch (e) {
        // Fallback for older browsers
        console.warn(`Performance observer for ${type} not supported`)
      }
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    if (!this.isEnabled) return

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    }

    this.metrics.push(metric)
    
    // Send to analytics service (implement based on your needs)
    this.sendToAnalytics('metric', metric)
  }

  /**
   * Record an authentication event
   */
  recordAuthEvent(event: Omit<AuthEvent, 'timestamp'>) {
    if (!this.isEnabled) return

    const authEvent: AuthEvent & { timestamp: number } = {
      ...event,
      timestamp: Date.now()
    }

    this.authEvents.push(authEvent)
    
    // Send to analytics service
    this.sendToAnalytics('auth-event', authEvent)
  }

  /**
   * Measure authentication flow performance
   */
  measureAuthFlow<T>(
    flowName: string, 
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now()
    
    return operation()
      .then((result) => {
        const duration = performance.now() - startTime
        
        this.recordAuthEvent({
          event: flowName as any,
          duration,
          success: true,
          metadata: { result: typeof result }
        })
        
        return result
      })
      .catch((error) => {
        const duration = performance.now() - startTime
        
        this.recordAuthEvent({
          event: 'error',
          duration,
          success: false,
          error: error.message,
          metadata: { flow: flowName }
        })
        
        throw error
      })
  }

  /**
   * Monitor Clerk component loading performance
   */
  measureClerkComponentLoad(componentName: string) {
    const startTime = performance.now()
    
    return {
      finish: () => {
        const loadTime = performance.now() - startTime
        this.recordMetric(`clerk-${componentName}-load`, loadTime, {
          component: componentName
        })
      }
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const now = Date.now()
    const last24h = now - (24 * 60 * 60 * 1000)
    
    const recentMetrics = this.metrics.filter(m => m.timestamp > last24h)
    const recentAuthEvents = this.authEvents.filter(e => e.timestamp > last24h)
    
    return {
      metrics: {
        total: recentMetrics.length,
        byType: this.groupBy(recentMetrics, 'name'),
        averages: this.calculateAverages(recentMetrics)
      },
      authEvents: {
        total: recentAuthEvents.length,
        byType: this.groupBy(recentAuthEvents, 'event'),
        successRate: this.calculateSuccessRate(recentAuthEvents)
      },
      webVitals: this.getWebVitalsScore()
    }
  }

  /**
   * Send data to analytics service
   */
  private sendToAnalytics(type: string, data: any) {
    // Implement based on your analytics service (Google Analytics, Mixpanel, etc.)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance Monitor] ${type}:`, data)
    }
    
    // Example: Send to Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', type, {
        custom_parameter: JSON.stringify(data)
      })
    }
    
    // Example: Send to custom analytics endpoint
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', JSON.stringify({ type, data }))
    }
  }

  /**
   * Group array by property
   */
  private groupBy<T>(array: T[], property: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const key = String(item[property])
      groups[key] = groups[key] || []
      groups[key].push(item)
      return groups
    }, {} as Record<string, T[]>)
  }

  /**
   * Calculate averages for metrics
   */
  private calculateAverages(metrics: PerformanceMetric[]) {
    const byName = this.groupBy(metrics, 'name')
    const averages: Record<string, number> = {}
    
    Object.entries(byName).forEach(([name, values]) => {
      const sum = values.reduce((acc, metric) => acc + metric.value, 0)
      averages[name] = sum / values.length
    })
    
    return averages
  }

  /**
   * Calculate success rate for auth events
   */
  private calculateSuccessRate(events: AuthEvent[]): number {
    if (events.length === 0) return 100
    
    const successful = events.filter(e => e.success).length
    return (successful / events.length) * 100
  }

  /**
   * Get Web Vitals score
   */
  private getWebVitalsScore() {
    const lcpMetrics = this.metrics.filter(m => m.name === 'LCP')
    const fidMetrics = this.metrics.filter(m => m.name === 'FID')
    const clsMetrics = this.metrics.filter(m => m.name === 'CLS')
    
    const avgLCP = lcpMetrics.length > 0 
      ? lcpMetrics.reduce((sum, m) => sum + m.value, 0) / lcpMetrics.length 
      : 0
    
    const avgFID = fidMetrics.length > 0 
      ? fidMetrics.reduce((sum, m) => sum + m.value, 0) / fidMetrics.length 
      : 0
    
    const avgCLS = clsMetrics.length > 0 
      ? clsMetrics.reduce((sum, m) => sum + m.value, 0) / clsMetrics.length 
      : 0
    
    return {
      LCP: {
        value: avgLCP,
        score: avgLCP < 2500 ? 'good' : avgLCP < 4000 ? 'needs-improvement' : 'poor'
      },
      FID: {
        value: avgFID,
        score: avgFID < 100 ? 'good' : avgFID < 300 ? 'needs-improvement' : 'poor'
      },
      CLS: {
        value: avgCLS,
        score: avgCLS < 0.1 ? 'good' : avgCLS < 0.25 ? 'needs-improvement' : 'poor'
      }
    }
  }

  /**
   * Clear old metrics to prevent memory leaks
   */
  cleanup() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    this.metrics = this.metrics.filter(m => m.timestamp > oneWeekAgo)
    this.authEvents = this.authEvents.filter(e => e.timestamp > oneWeekAgo)
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Utility functions for easy use in components
export const measureAuthFlow = performanceMonitor.measureAuthFlow.bind(performanceMonitor)
export const recordAuthEvent = performanceMonitor.recordAuthEvent.bind(performanceMonitor)
export const recordMetric = performanceMonitor.recordMetric.bind(performanceMonitor)
export const measureClerkComponentLoad = performanceMonitor.measureClerkComponentLoad.bind(performanceMonitor)

// Auto-cleanup every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceMonitor.cleanup()
  }, 60 * 60 * 1000)
}