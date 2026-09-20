import { useEffect, useState } from "react"

/**
 * The shortcut the browser has bound to the toggle command, if any. Shown in the
 * popup and on the welcome page so the keyboard route is discoverable.
 */
export function useCommandShortcut(): string {
  const [shortcut, setShortcut] = useState("")

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const commands = (await chrome.commands?.getAll?.()) ?? []
        if (cancelled) {
          return
        }
        setShortcut(
          commands.find((command) => command.name === "toggle-annotation")
            ?.shortcut ?? ""
        )
      } catch {
        // Without the commands API the hint is simply not shown.
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return shortcut
}
