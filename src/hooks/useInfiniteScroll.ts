import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollProps {
  onScrollNearTop: () => void
  onScrollNearBottom: () => void
  threshold?: number
}

export const useInfiniteScroll = ({
  onScrollNearTop,
  onScrollNearBottom,
  threshold = 1000,
}: UseInfiniteScrollProps) => {
  const scrollElementRef = useRef<HTMLElement | null>(null)
  const isLoadingRef = useRef(false)

  const handleScroll = useCallback(() => {
    if (!scrollElementRef.current || isLoadingRef.current) return

    const element = scrollElementRef.current
    const { scrollTop, scrollHeight, clientHeight } = element

    // Check if near top
    if (scrollTop < threshold) {
      isLoadingRef.current = true

      // Store current scroll position relative to content
      const currentScrollHeight = scrollHeight
      const relativeScrollTop = scrollTop

      // Load more content at the top
      onScrollNearTop()

      // Restore scroll position after content is added
      requestAnimationFrame(() => {
        if (scrollElementRef.current) {
          const newScrollHeight = scrollElementRef.current.scrollHeight
          const heightDifference = newScrollHeight - currentScrollHeight
          scrollElementRef.current.scrollTop =
            relativeScrollTop + heightDifference
        }

        setTimeout(() => {
          isLoadingRef.current = false
        }, 100)
      })
    }

    // Check if near bottom
    if (scrollTop + clientHeight > scrollHeight - threshold) {
      isLoadingRef.current = true
      onScrollNearBottom()
      // Reset loading flag after a short delay
      setTimeout(() => {
        isLoadingRef.current = false
      }, 100)
    }
  }, [onScrollNearTop, onScrollNearBottom, threshold])

  useEffect(() => {
    const element = document.querySelector('.events-panel') as HTMLElement
    if (!element) return

    scrollElementRef.current = element
    element.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      element.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return scrollElementRef
}
