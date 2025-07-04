import { useEffect, useState } from 'react'

interface Verse {
  text: string
  reference: string
}

export function useVerseOfTheDay() {
  const [verse, setVerse] = useState<Verse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check localStorage for today's verse
    const today = new Date().toISOString().slice(0, 10)
    const cached = localStorage.getItem('verse-of-the-day')
    if (cached) {
      const { date, verse: cachedVerse } = JSON.parse(cached)
      if (date === today) {
        setVerse(cachedVerse)
        setLoading(false)
        return
      }
    }

    fetch('https://beta.ourmanna.com/api/v1/get/?format=json')
      .then((res) => res.json())
      .then((data) => {
        const newVerse = {
          text: data.verse.details.text,
          reference: data.verse.details.reference,
        }
        setVerse(newVerse)
        localStorage.setItem(
          'verse-of-the-day',
          JSON.stringify({ date: today, verse: newVerse }),
        )
      })
      .catch((err) => {
        setError('Failed to load verse of the day.')
      })
      .finally(() => setLoading(false))
  }, [])

  return { verse, loading, error }
}
