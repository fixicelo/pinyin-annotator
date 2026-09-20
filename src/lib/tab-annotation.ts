import {
  TAB_ANNOTATION_MESSAGE,
  TAB_ANNOTATION_QUERY,
  type TabAnnotationQuery,
  type TabAnnotationReport
} from "~constants"

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

/**
 * Remembers which tabs the user asked to annotate.
 *
 * A frame only ever annotates when it is told to, and telling it happens once:
 * a streaming site's player iframe is created — and later navigated — well
 * after the click, so its document would otherwise start idle and need another
 * click. Recording the request per tab lets each frame ask on startup instead,
 * which is what Monitor mode then keeps running.
 */
export class TabAnnotationRegistry {
  private annotatingTabs = new Set<number>()

  isAnnotating(tabId: number): boolean {
    return this.annotatingTabs.has(tabId)
  }

  set(tabId: number, annotating: boolean) {
    if (annotating) {
      this.annotatingTabs.add(tabId)
      return
    }
    this.annotatingTabs.delete(tabId)
  }

  /** Drops a tab: it closed, or navigated to a new page. */
  forget(tabId: number) {
    this.annotatingTabs.delete(tabId)
  }

  /**
   * Answers a frame asking about its tab and records what other frames report.
   * Returns the response to send, or undefined for messages this does not own.
   */
  handleMessage(
    message: unknown,
    tabId: number | undefined
  ): { annotating: boolean } | undefined {
    if (isTabAnnotationQuery(message)) {
      return { annotating: tabId !== undefined && this.isAnnotating(tabId) }
    }

    if (!isTabAnnotationReport(message)) {
      return undefined
    }

    // Extension pages have no tab of their own and pass one along instead.
    const target = tabId ?? message.tabId
    if (target !== undefined) {
      this.set(target, message.annotating)
    }

    return undefined
  }
}
