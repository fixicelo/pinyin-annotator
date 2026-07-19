import { useEffect } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { StorageKey, Theme } from "~constants"

export function useTheme() {
  const [theme] = useStorage<Theme>(StorageKey.theme, Theme.System)

  useEffect(() => {
    const el = document.documentElement
    if (theme === Theme.Light) {
      el.setAttribute("data-theme", "light")
    } else if (theme === Theme.Dark) {
      el.setAttribute("data-theme", "dark")
    } else {
      el.removeAttribute("data-theme")
    }
  }, [theme])
}
