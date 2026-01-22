"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "skill-pilot-search-history"
const MAX_HISTORY_ITEMS = 10

export interface SearchHistoryItem {
  id: string
  query: string
  timestamp: number
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as SearchHistoryItem[]
        setHistory(parsed)
      }
    } catch (error) {
      console.error("Failed to load search history:", error)
    }
    setIsLoaded(true)
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
      } catch (error) {
        console.error("Failed to save search history:", error)
      }
    }
  }, [history, isLoaded])

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return

    const trimmedQuery = query.trim()
    
    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter(
        (item) => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
      )

      // Add new item at the beginning
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: trimmedQuery,
        timestamp: Date.now(),
      }

      // Keep only the most recent items
      return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)
    })
  }, [])

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const getFilteredHistory = useCallback(
    (filter: string) => {
      if (!filter.trim()) return history
      const lowerFilter = filter.toLowerCase()
      return history.filter((item) =>
        item.query.toLowerCase().includes(lowerFilter)
      )
    },
    [history]
  )

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getFilteredHistory,
    isLoaded,
  }
}
