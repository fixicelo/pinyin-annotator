/**
 * A fresh install turns Auto-Annotate on so the extension does what its listing
 * promises on the next page load, and the popup says so once. That notice is
 * kept in local storage: it records what this device has already shown, not a
 * preference worth syncing to the user's other browsers.
 */
const FIRST_RUN_NOTICE_KEY = "pya-first-run-notice"

export async function markFirstRunNotice(): Promise<void> {
  try {
    await chrome.storage.local.set({ [FIRST_RUN_NOTICE_KEY]: true })
  } catch {
    // The notice is a courtesy; failing to store it must not fail the install.
  }
}

export async function shouldShowFirstRunNotice(): Promise<boolean> {
  try {
    const stored = await chrome.storage.local.get(FIRST_RUN_NOTICE_KEY)
    return stored?.[FIRST_RUN_NOTICE_KEY] === true
  } catch {
    return false
  }
}

export async function clearFirstRunNotice(): Promise<void> {
  try {
    await chrome.storage.local.remove(FIRST_RUN_NOTICE_KEY)
  } catch {
    // Nothing to do: it will be gone after the next install anyway.
  }
}
