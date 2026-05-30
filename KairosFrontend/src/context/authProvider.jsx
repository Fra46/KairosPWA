"use client"

import { useEffect, useState } from "react"
import { AuthContext } from "./authContext"
import { auth } from "../firebase/config"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import api from '../services/api'
import { userService } from '../services/userService'

export function AuthProvider({ children }) {
  const normalizeUser = (rawUser) => {
    if (!rawUser) return null
    return {
      ...rawUser,
      id: rawUser.id ?? rawUser.idUser,
      idUser: rawUser.id ?? rawUser.idUser,
      role: rawUser.role ?? rawUser.rol ?? rawUser.roleName ?? rawUser.rolName,
      roleName: rawUser.roleName ?? rawUser.rolName ?? rawUser.role,
      userName: rawUser.userName ?? rawUser.name,
      name: rawUser.name ?? rawUser.userName,
    }
  }

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("kairos_auth")
    if (!stored) return null

    try {
      const parsed = JSON.parse(stored)
      return normalizeUser(parsed.user) || null
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

  const [loading, setLoading] = useState(true)

  const getStoredAuthData = () => {
    const stored = localStorage.getItem("kairos_auth")
    if (!stored) return null

    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }

  const setStoredAuthData = (authData) => {
    localStorage.setItem("kairos_auth", JSON.stringify(authData))
  }

  useEffect(() => {
    const storedAuth = getStoredAuthData()
    if (storedAuth?.authProvider === 'backend' || (storedAuth?.token && storedAuth?.user && !storedAuth?.authProvider)) {
      setUser(normalizeUser(storedAuth.user))
      setToken(storedAuth.token)
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const idToken = await fbUser.getIdToken()
        const u = { uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName }

        let authData = { user: u, token: idToken, authProvider: 'firebase' }
        try {
          const resp = await api.post('/auth/firebase', { idToken })
          if (resp?.data?.user && resp?.data?.token) {
            authData = { user: resp.data.user, token: resp.data.token, authProvider: 'firebase' }
          } else {
            throw new Error('No se recibió usuario o token desde el backend de Firebase.')
          }
        } catch (err) {
          console.warn('Intercambio Firebase->Backend falló:', err?.response?.data || err.message)
          // No borramos automáticamente si ya había un token válido almacenado.
          const stored = getStoredAuthData()
          if (stored?.token && stored?.user) {
            setUser(normalizeUser(stored.user))
            setToken(stored.token)
            setLoading(false)
            return
          }
          setUser(null)
          setToken(null)
          localStorage.removeItem("kairos_auth")
          setLoading(false)
          return
        }

        authData.user = normalizeUser(authData.user)
        setUser(authData.user)
        setToken(authData.token)
        setStoredAuthData(authData)
      } else {
        const stored = getStoredAuthData()
        if (stored?.token && stored?.user) {
          setUser(normalizeUser(stored.user))
          setToken(stored.token)
        } else {
          setUser(null)
          setToken(null)
          localStorage.removeItem("kairos_auth")
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        const idToken = await cred.user.getIdToken()

        try {
          const resp = await api.post('/auth/firebase', { idToken })
          if (resp?.data?.user && resp?.data?.token) {
            const authData = { user: normalizeUser(resp.data.user), token: resp.data.token, authProvider: 'firebase' }
            setUser(authData.user)
            setToken(authData.token)
            setStoredAuthData(authData)
            return resp.data
          }

          throw new Error('No se recibió un token válido desde el backend.')
        } catch (err) {
          console.warn('Intercambio Firebase->Backend falló en login:', err?.response?.data || err.message)
          await signOut(auth)
          throw new Error('No se pudo completar la autenticación con Firebase en el backend. Verifique la configuración de Firebase en el servidor.')
        }
      } catch (firebaseError) {
        // Si falla la autenticación Firebase (usuario no existe o no es email), probamos backend local
        console.warn('Firebase login falló, intentando login local:', firebaseError?.code || firebaseError?.message)

        const resp = await userService.Login({ userName: email, password })
        if (resp?.token) {
          const authData = { user: normalizeUser(resp.user), token: resp.token, authProvider: 'backend' }
          setUser(authData.user)
          setToken(authData.token)
          setStoredAuthData(authData)
          try {
            await signOut(auth)
          } catch {
            // Ignoramos si no había sesión Firebase activa
          }
          return authData
        }

        throw firebaseError
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setToken(null)
    localStorage.removeItem("kairos_auth")
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
