import { useEffect, useState } from 'react'

export default function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [supportsPwa, setSupportsPwa] = useState(false)

  useEffect(() => {
    setSupportsPwa('serviceWorker' in navigator && window.matchMedia('(display-mode: browser)').matches)

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) {
      window.alert(
        'Si el navegador no muestra el prompt automáticamente, usa el menú del navegador y selecciona "Instalar" o "Añadir a pantalla de inicio".'
      )
      return null
    }

    deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice

    if (choiceResult.outcome === 'accepted') {
      setDeferredPrompt(null)
    }

    return choiceResult
  }

  return {
    canInstall: (!!deferredPrompt || supportsPwa) && !isInstalled,
    promptInstall,
    isInstalled
  }
}
