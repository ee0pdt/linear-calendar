import { useEffect, useState } from 'react'
import { Activity, Clock, Eye, Layers, Wifi, Zap } from 'lucide-react'
import { getPerformanceData, subscribeToPerformance } from '../reportWebVitals'
import type { PerformanceMetrics } from '../reportWebVitals'

interface PerformanceDashboardProps {
  isVisible: boolean
  onToggle: () => void
}

export function PerformanceDashboard({
  isVisible,
  onToggle,
}: PerformanceDashboardProps) {
  const [metrics, setMetrics] =
    useState<PerformanceMetrics>(getPerformanceData())

  useEffect(() => {
    const unsubscribe = subscribeToPerformance(setMetrics)
    return unsubscribe
  }, [])

  if (!import.meta.env.DEV && !isVisible) return null

  const formatValue = (
    value: number | undefined,
    unit: string = 'ms',
  ): string => {
    if (value === undefined) return 'N/A'
    return `${value.toFixed(2)}${unit}`
  }

  const getRating = (
    value: number | undefined,
    thresholds: [number, number],
  ): 'good' | 'needs-improvement' | 'poor' | 'unknown' => {
    if (value === undefined) return 'unknown'
    if (value <= thresholds[0]) return 'good'
    if (value <= thresholds[1]) return 'needs-improvement'
    return 'poor'
  }

  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case 'good':
        return 'text-green-600 bg-green-50'
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-50'
      case 'poor':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const performanceItems = [
    {
      name: 'First Contentful Paint',
      key: 'FCP' as keyof PerformanceMetrics,
      icon: Eye,
      description: 'Time until first text/image appears',
      thresholds: [1800, 3000] as [number, number],
      unit: 'ms',
    },
    {
      name: 'Largest Contentful Paint',
      key: 'LCP' as keyof PerformanceMetrics,
      icon: Layers,
      description: 'Time until largest element appears',
      thresholds: [2500, 4000] as [number, number],
      unit: 'ms',
    },
    {
      name: 'Cumulative Layout Shift',
      key: 'CLS' as keyof PerformanceMetrics,
      icon: Activity,
      description: 'Visual stability score',
      thresholds: [0.1, 0.25] as [number, number],
      unit: '',
    },
    {
      name: 'Interaction to Next Paint',
      key: 'INP' as keyof PerformanceMetrics,
      icon: Zap,
      description: 'Responsiveness to user input',
      thresholds: [200, 500] as [number, number],
      unit: 'ms',
    },
    {
      name: 'Time to First Byte',
      key: 'TTFB' as keyof PerformanceMetrics,
      icon: Wifi,
      description: 'Server response time',
      thresholds: [800, 1800] as [number, number],
      unit: 'ms',
    },
  ]

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
        title="Toggle Performance Dashboard"
      >
        <Activity size={20} />
      </button>

      {/* Dashboard */}
      {isVisible && (
        <div className="fixed top-16 right-4 z-40 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-96 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">
                Performance Metrics
              </h3>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {performanceItems.map(
              ({ name, key, icon: Icon, description, thresholds, unit }) => {
                const value = metrics[key]
                const rating = getRating(value, thresholds)
                const colorClass = getRatingColor(rating)

                return (
                  <div
                    key={key}
                    className="border border-gray-100 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <Icon size={16} className="text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">
                            {name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {description}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}
                      >
                        {formatValue(value, unit)}
                      </div>
                    </div>
                  </div>
                )
              },
            )}
          </div>

          {metrics.timestamp && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}

          <div className="mt-3 text-xs text-gray-400">
            Open DevTools Console for detailed performance logs
          </div>
        </div>
      )}
    </>
  )
}
