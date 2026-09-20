import {
  TAB_ANNOTATION_MESSAGE,
  TAB_ANNOTATION_QUERY,
  type TabAnnotationQuery,
  type TabAnnotationReport
} from "~constants"

/** Session storage survives a service worker restart, not a browser restart. */
const STORAGE_KEY = "pya-annotating-tabs"

/** The part of `chrome.storage.session` this needs, so tests can stand in. */
export interface SessionStorageArea {
  get(key: string): Promise<Record<string, unknown>>
  set(items: Record<string, unknown>): Promise<void>
}

export function isTabAnnotationReport(
  value: unknown
): value is TabAnnotationReport {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as TabAnnotationReport).type === TAB_ANNOTATION_MESSAGE &&
    typeof (value as TabAnnotationReport).annotating === "boolean"
  )
}

export function isTabAnnotationQuery(
  value: unknown
): value is TabAnnotationQuery {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as TabAnnotationQuery).type === TAB_ANNOTATION_QUERY
  )
}

export function isTabAnnotationMessage(value: unknown): boolean {
  return isTabAnnotationReport(value) || isTabAnnotationQuery(value)
}

/**
 * Remembers which tabs the user asked to annotate.
 *
 * A frame only ever annotates when it is told to, and telling it happens once:
 * a streaming site's player iframe is created — and later navigated — well
 * after the click, so its document would otherwise start idle and need another
 * click. Recording the request per tab lets each frame ask on startup instead,
 * which is what Monitor mode then keeps running.
 *
 * The record is kept in session storage because the background is a service
 * worker the browser stops when it goes idle: held in memory alone, the request
 * would be forgotten while the page is still open, and a player iframe created
 * after that would go unannotated again.
 */
export class TabAnnotationRegistry {
  private annotatingTabs = new Set<number>()
  private hydration: Promise<void> | null = null

  constructor(private storage?: SessionStorageArea) {}

  private hydrate(): Promise<void> {
    if (!this.hydration) {
      this.hydration = this.read()
    }
    return this.hydration
  }

  private async read(): Promise<void> {
    if (!this.storage) {
      return
    }

    try {
      const stored = await this.storage.get(STORAGE_KEY)
      const tabs = stored?.[STORAGE_KEY]
      if (!Array.isArray(tabs)) {
        return
      }
      for (const tabId of tabs) {
        if (typeof tabId === "number") {
          this.annotatingTabs.add(tabId)
        }
      }
    } catch {
      // An unreadable record leaves tabs unannotated, which is the safe state.
    }
  }

  private async write(): Promise<void> {
    if (!this.storage) {
      return
    }

    try {
      await this.storage.set({ [STORAGE_KEY]: [...this.annotatingTabs] })
    } catch {
      // The request is still honoured for as long as this worker lives.
    }
  }

  async isAnnotating(tabId: number): Promise<boolean> {
    await this.hydrate()
    return this.annotatingTabs.has(tabId)
  }

  async set(tabId: number, annotating: boolean): Promise<void> {
    await this.hydrate()

    const isRecorded = this.annotatingTabs.has(tabId)
    if (isRecorded === annotating) {
      return
    }

    if (annotating) {
      this.annotatingTabs.add(tabId)
    } else {
      this.annotatingTabs.delete(tabId)
    }
    await this.write()
  }

  /** Drops a tab: it closed, or navigated to a new page. */
  async forget(tabId: number): Promise<void> {
    await this.set(tabId, false)
  }

  /**
   * Answers a frame asking about its tab and records what other frames report.
   * Resolves with the response to send, or undefined for messages this does not
   * own.
   */
  async handleMessage(
    message: unknown,
    tabId: number | undefined
  ): Promise<{ annotating: boolean } | undefined> {
    if (isTabAnnotationQuery(message)) {
      return {
        annotating: tabId !== undefined && (await this.isAnnotating(tabId))
      }
    }

    if (!isTabAnnotationReport(message)) {
      return undefined
    }

    // Extension pages have no tab of their own and pass one along instead.
    const target = tabId ?? message.tabId
    if (target !== undefined) {
      await this.set(target, message.annotating)
    }

    return undefined
  }
}
