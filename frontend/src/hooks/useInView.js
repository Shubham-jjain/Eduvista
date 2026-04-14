import { useState, useCallback } from 'react'

// Detects when an element enters the viewport using IntersectionObserver (callback ref pattern)
const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false)

  const ref = useCallback((element) => {
    if (!element || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(element)
        }
      },
      { threshold: 0.15, ...options }
    )

    observer.observe(element)
  }, [isInView])

  return [ref, isInView]
}

export default useInView
