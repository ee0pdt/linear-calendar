import { useCallback, useEffect, useRef, useState } from 'react'
import { PerformanceTimer } from '../reportWebVitals'

interface LoadingState {
  isLoading: boolean
  loadingText?: string
  startTime?: number
}

interface PerformanceLog {
  action: string
  duration: number
  timestamp: number
}

export function usePerformanceTracking() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
  })
  const [performanceLogs, setPerformanceLogs] = useState<Array<PerformanceLog>>(
    [],
  )
  const timersRef = useRef<Map<string, PerformanceTimer>>(new Map())

  // Track loading states
  const startLoading = useCallback((text?: string) => {
    setLoadingState({
      isLoading: true,
      loadingText: text,
      startTime: performance.now(),
    })
  }, [])

  const stopLoading = useCallback(() => {
    setLoadingState((prev) => {
      if (prev.startTime) {
        const duration = performance.now() - prev.startTime
        const log: PerformanceLog = {
          action: prev.loadingText || 'Loading',
          duration,
          timestamp: Date.now(),
        }

        setPerformanceLogs((logs) => [...logs.slice(-19), log]) // Keep last 20 logs

        if (import.meta.env.DEV) {
          console.log(
            `📊 Loading completed: ${log.action} - ${duration.toFixed(2)}ms`,
          )
        }
      }

      return { isLoading: false }
    })
  }, [])

  // Track custom actions
  const startTimer = useCallback((name: string) => {
    const timer = new PerformanceTimer(name)
    timersRef.current.set(name, timer)
    return timer
  }, [])

  const endTimer = useCallback((name: string) => {
    const timer = timersRef.current.get(name)
    if (timer) {
      const duration = timer.end()
      timersRef.current.delete(name)

      const log: PerformanceLog = {
        action: name,
        duration,
        timestamp: Date.now(),
      }

      setPerformanceLogs((logs) => [...logs.slice(-19), log])
      return duration
    }
    return 0
  }, [])

  // Component render tracking
  const trackRender = useCallback((componentName: string) => {
    if (import.meta.env.DEV) {
      const renderTime = performance.now()
      console.log(
        `🔄 Component rendered: ${componentName} at ${renderTime.toFixed(2)}ms`,
      )
    }
  }, [])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.clear()
    }
  }, [])

  return {
    loadingState,
    performanceLogs,
    startLoading,
    stopLoading,
    startTimer,
    endTimer,
    trackRender,
  }
}

// Hook for tracking modal performance specifically
export function useModalPerformance(modalName: string) {
  const timerRef = useRef<PerformanceTimer | null>(null)

  const trackOpen = useCallback(() => {
    timerRef.current = new PerformanceTimer(`Modal ${modalName} Open`)
  }, [modalName])

  const trackOpenComplete = useCallback(() => {
    if (timerRef.current) {
      timerRef.current.end()
      timerRef.current = null
    }
  }, [])

  const trackClose = useCallback(() => {
    const timer = new PerformanceTimer(`Modal ${modalName} Close`)
    // Auto-end after a short delay to capture close animation
    setTimeout(() => timer.end(), 300)
  }, [modalName])

  return {
    trackOpen,
    trackOpenComplete,
    trackClose,
  }
}

// Hook for tracking page load performance
export function usePageLoadTracking() {
  const [pageLoadMetrics, setPageLoadMetrics] = useState({
    navigationStart: 0,
    domContentLoaded: 0,
    loadComplete: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
  })

  useEffect(() => {
    const updateMetrics = () => {
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')

      setPageLoadMetrics({
        navigationStart: navigation ? navigation.startTime : 0,
        domContentLoaded: navigation
          ? navigation.domContentLoadedEventEnd - navigation.startTime
          : 0,
        loadComplete: navigation
          ? navigation.loadEventEnd - navigation.startTime
          : 0,
        firstPaint: paint.find((p) => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint:
          paint.find((p) => p.name === 'first-contentful-paint')?.startTime ||
          0,
      })
    }

    // Initial update
    updateMetrics()

    // Update after load event
    if (document.readyState === 'complete') {
      updateMetrics()
    } else {
      window.addEventListener('load', updateMetrics)
      return () => window.removeEventListener('load', updateMetrics)
    }
  }, [])

  useEffect(() => {
    if (import.meta.env.DEV && pageLoadMetrics.loadComplete > 0) {
      console.group('📈 Page Load Metrics')
      console.log(
        `DOM Content Loaded: ${pageLoadMetrics.domContentLoaded.toFixed(2)}ms`,
      )
      console.log(`Load Complete: ${pageLoadMetrics.loadComplete.toFixed(2)}ms`)
      console.log(`First Paint: ${pageLoadMetrics.firstPaint.toFixed(2)}ms`)
      console.log(
        `First Contentful Paint: ${pageLoadMetrics.firstContentfulPaint.toFixed(2)}ms`,
      )
      console.groupEnd()
    }
  }, [pageLoadMetrics])

  return pageLoadMetrics
}
