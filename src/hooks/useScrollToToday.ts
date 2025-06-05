import { useRef } from 'react'

export function useScrollToToday() {
  const todayRef = useRef<HTMLDivElement>(null)

  const jumpToToday = () => {
    if (todayRef.current) {
      const element = todayRef.current
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - 64
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return {
    todayRef,
    jumpToToday,
  }
}
