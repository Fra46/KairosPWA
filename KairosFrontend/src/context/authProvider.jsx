"use client"

import { useState } from "react"
import { authContext } from "./authContext"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("kairos_auth")
    if (!stored) return null

    try {
      const parsed = JSON.parse(stored)
      return parsed.user || null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("kairos_auth")
    if (!stored) return null

    try {
      const parsed = JSON.parse(stored)
      return parsed.token || null
    } catch {
      return null
    }
  })

  const [loading] = useState(false)

  const login = (data) => {
    const authData = {
      user: data.user,
      token: data.token,
    }
    setUser(authData.user)
    setToken(authData.token)
    localStorage.setItem("kairos_auth", JSON.stringify(authData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("kairos_auth")
  }

  return (
    <authContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </authContext.Provider>
  )
}
