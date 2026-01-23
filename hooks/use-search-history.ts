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

  // Load history from DB and fallback to localStorage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // Try local storage first for speed
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          setHistory(JSON.parse(stored))
        }

        // Then fetch from DB to sync
        const response = await fetch("/api/user/search-history")
        const data = await response.json()

        if (data.history && data.history.length > 0) {
          const dbHistory = data.history.map((item: any) => ({
            id: item.id,
            query: item.query,
            timestamp: new Date(item.created_at).getTime()
          }))
          setHistory(dbHistory)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dbHistory))
        }
      } catch (error) {
        console.error("Failed to load search history:", error)
      } finally {
        setIsLoaded(true)
      }
    }
    loadHistory()
  }, [])

  const addToHistory = useCallback(async (query: string) => {
    if (!query.trim()) return
    const trimmedQuery = query.trim()

    // Update local state immediately for responsiveness
    setHistory((prev) => {
      const filtered = prev.filter(
        (item) => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
      )
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: trimmedQuery,
        timestamp: Date.now(),
      }
      const newHistory = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      return newHistory
    })

    // Save to DB in background
    try {
      await fetch("/api/user/search-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmedQuery })
      })
    } catch (error) {
      console.error("Failed to save search to DB:", error)
    }
  }, [])

  const removeFromHistory = useCallback(async (id: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      return newHistory
    })

    try {
      await fetch("/api/user/search-history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
    } catch (error) {
      console.error("Failed to delete from DB:", error)
    }
  }, [])

  const clearHistory = useCallback(async () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
    try {
      await fetch("/api/user/search-history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })
    } catch (error) {
      console.error("Failed to clear DB history:", error)
    }
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
