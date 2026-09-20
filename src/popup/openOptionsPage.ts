/**
 * Opens the options page, reusing the tab that already has it open so the popup
 * does not pile up copies of it.
 */
export async function openOptionsPage() {
  let opened = false
  try {
    const url = chrome.runtime.getURL("options.html")
    const existingTabs = await chrome.tabs.query({ url })
    const existingTab = existingTabs.find((tab) => tab.id != null)
    const tab = existingTab ?? (await chrome.tabs.create({ url, active: true }))
    if (tab?.id) {
      await chrome.tabs.update(tab.id, { active: true })
      opened = true
    }
    if (opened && tab.windowId && chrome.windows?.update) {
      await chrome.windows.update(tab.windowId, { focused: true })
    }
  } catch {
    if (!opened) {
      chrome.runtime.openOptionsPage()
    }
  } finally {
    if (opened) {
      window.close()
    }
  }
}
