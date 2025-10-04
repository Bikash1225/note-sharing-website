'use client'

import { useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { performanceMonitor, recordAuthEvent, measureClerkComponentLoad } from '@/lib/monitoring/performance'

/**
 * Hook for performance monitoring in React components
 */
export function usePerformance() {
  const { user, isLoaded } = useUser()

  // Track component mount performance
  const trackComponentMount = useCallback((componentName: string) => {
    const measurement = measureClerkComponentLoad(componentName)
    
    useEffect(() => {
      return () => {
        measurement.finish()
      }
    }, [measurement])
  }, [])

  // Track authentication events
  const trackAuthEvent = useCallback((
    event: 'sign-in' | 'sign-up' | 'sign-out' | 'profile-update' | 'error',
    success: boolean,
    error?: string,
    metadata?: Record<string, any>
  ) => {
    recordAuthEvent({
      event,
      userId: user?.id,
      success,
      error,
      metadata
    })
  }, [user?.id])

  // Track page load performance
  const trackPageLoad = useCallback((pageName: string) => {
    useEffect(() => {
      const startTime = performance.now()
      
      return () => {
        const loadTime = performance.now() - startTime
        performanceMonitor.recordMetric(`page-${pageName}-render`, loadTime, {
          page: pageName,
          userId: user?.id
        })
      }
    }, [pageName, user?.id])
  }, [user?.id])

  // Track user interactions
  const trackInteraction = useCallback((
    action: string,
    element?: string,
    metadata?: Record<string, any>
  ) => {
    performanceMonitor.recordMetric(`interaction-${action}`, performance.now(), {
      element,
      userId: user?.id,
      ...metadata
    })
  }, [user?.id])

  // Track API call performance
  const trackApiCall = useCallback(async <T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await apiCall()
      const duration = performance.now() - startTime
      
      performanceMonitor.recordMetric(`api-${endpoint}`, duration, {
        success: true,
        userId: user?.id
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      performanceMonitor.recordMetric(`api-${endpoint}`, duration, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user?.id
      })
      
      throw error
    }
  }, [user?.id])

  return {
    trackComponentMount,
    trackAuthEvent,
    trackPageLoad,
    trackInteraction,
    trackApiCall,
    isLoaded,
    userId: user?.id
  }
}

/**
 * Hook for tracking Clerk component performance
 */
export function useClerkPerformance(componentName: string) {
  const { trackComponentMount, trackAuthEvent } = usePerformance()

  useEffect(() => {
    trackComponentMount(componentName)
  }, [componentName, trackComponentMount])

  const trackSignIn = useCallback((success: boolean, error?: string) => {
    trackAuthEvent('sign-in', success, error, { component: componentName })
  }, [trackAuthEvent, componentName])

  const trackSignUp = useCallback((success: boolean, error?: string) => {
    trackAuthEvent('sign-up', success, error, { component: componentName })
  }, [trackAuthEvent, componentName])

  const trackSignOut = useCallback((success: boolean, error?: string) => {
    trackAuthEvent('sign-out', success, error, { component: componentName })
  }, [trackAuthEvent, componentName])

  const trackProfileUpdate = useCallback((success: boolean, error?: string) => {
    trackAuthEvent('profile-update', success, error, { component: componentName })
  }, [trackAuthEvent, componentName])

  return {
    trackSignIn,
    trackSignUp,
    trackSignOut,
    trackProfileUpdate
  }
}