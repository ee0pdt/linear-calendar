import type { Metric } from 'web-vitals'

export interface PerformanceMetrics {
  CLS?: number
  INP?: number
  FCP?: number
  LCP?: number
  TTFB?: number
  timestamp?: number
}

const performanceData: PerformanceMetrics = {}
let performanceCallbacks: Array<(metrics: PerformanceMetrics) => void> = []

const handleMetric = (metric: Metric) => {
  performanceData[metric.name as keyof PerformanceMetrics] = metric.value
  performanceData.timestamp = Date.now()

  // Log to console in development
  if (import.meta.env.DEV) {
    console.group(`🚀 Performance Metric: ${metric.name}`)
    console.log(`Value: ${metric.value}`)
    console.log(`Rating: ${metric.rating}`)
    console.log(`Delta: ${metric.delta}`)
    console.groupEnd()
  }

  // Notify all subscribers
  performanceCallbacks.forEach((callback) => callback({ ...performanceData }))
}

const reportWebVitals = (onPerfEntry?: (metric: Metric) => void) => {
  const callback = onPerfEntry || handleMetric

  import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    onCLS(callback)
    onINP(callback)
    onFCP(callback)
    onLCP(callback)
    onTTFB(callback)
  })
}

// Subscribe to performance updates
export const subscribeToPerformance = (
  callback: (metrics: PerformanceMetrics) => void,
) => {
  performanceCallbacks.push(callback)

  // Return unsubscribe function
  return () => {
    performanceCallbacks = performanceCallbacks.filter((cb) => cb !== callback)
  }
}

// Get current performance data
export const getPerformanceData = (): PerformanceMetrics => ({
  ...performanceData,
})

// Custom performance timers
export class PerformanceTimer {
  private startTime: number
  private name: string

  constructor(name: string) {
    this.name = name
    this.startTime = performance.now()

    if (import.meta.env.DEV) {
      console.log(`⏱️ Timer started: ${name}`)
    }
  }

  end(): number {
    const duration = performance.now() - this.startTime

    if (import.meta.env.DEV) {
      console.log(`⏱️ Timer ended: ${this.name} - ${duration.toFixed(2)}ms`)
    }

    return duration
  }
}

// Track modal performance
export const trackModalPerformance = {
  start: (modalName: string) => new PerformanceTimer(`Modal ${modalName} Open`),

  close: (modalName: string) =>
    new PerformanceTimer(`Modal ${modalName} Close`),
}

export default reportWebVitals
