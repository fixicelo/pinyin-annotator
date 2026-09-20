import {
  FRAME_STATUS_MESSAGE,
  ResponseStatus,
  type FrameStatusReport
} from "~constants"

/** How long frames are given to answer before `resolve` settles. */
export const FRAME_STATUS_TIMEOUT_MS = 150

export interface FrameStatusOptions {
  timeoutMs?: number
  /**
   * Called when a frame reports itself annotated after the first answer, which
   * happens whenever a frame needs longer than the window to annotate — a
   * player iframe is free to finish long after the top frame answered.
   */
  onAnnotated?: () => void
}

export interface FrameStatusCollector {
  /** Merges a status that arrived some other way, such as a response. */
  record(status: ResponseStatus): void
  /** The merged answer so far. */
  isAnnotated(): boolean
  /** Resolves with the merged answer once the collection window has passed. */
  resolve(): Promise<boolean>
  /** Stops listening. */
  dispose(): void
}

function isFrameStatusReport(value: unknown): value is FrameStatusReport {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as FrameStatusReport).type === FRAME_STATUS_MESSAGE
  )
}

/**
 * Merges the annotation status every frame of a tab reports while handling one
 * action.
 *
 * `chrome.tabs.sendMessage` delivers an action to every frame but only resolves
 * with the first response, so a page whose captions live in a cross-origin
 * player iframe would otherwise be judged by the top frame alone. Any frame
 * reporting itself annotated wins; "not annotated" is only the answer once no
 * frame claimed otherwise within the window.
 */
export function collectFrameStatus(
  tabId: number,
  requestId: number,
  options: FrameStatusOptions = {}
): FrameStatusCollector {
  const { timeoutMs = FRAME_STATUS_TIMEOUT_MS, onAnnotated } = options
  let annotated = false
  let closed = false

  const markAnnotated = () => {
    if (annotated) return
    annotated = true
    onAnnotated?.()
  }

  const listener = (message: unknown, sender: chrome.runtime.MessageSender) => {
    if (
      closed ||
      sender.tab?.id !== tabId ||
      !isFrameStatusReport(message) ||
      message.requestId !== requestId
    ) {
      return
    }
    if (message.status === ResponseStatus.Annotated) {
      markAnnotated()
    }
  }

  chrome.runtime.onMessage.addListener(listener)

  return {
    record(status) {
      if (closed || status !== ResponseStatus.Annotated) {
        return
      }
      markAnnotated()
    },
    isAnnotated: () => annotated,
    resolve: () =>
      new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(annotated), timeoutMs)
      }),
    dispose() {
      if (closed) return
      closed = true
      chrome.runtime.onMessage.removeListener(listener)
    }
  }
}

/** Tells whoever is listening how this frame ended up. */
export function reportFrameStatus(
  requestId: number | undefined,
  status: ResponseStatus
) {
  if (requestId === undefined || !chrome.runtime?.sendMessage) {
    return
  }
  try {
    void Promise.resolve(
      chrome.runtime.sendMessage({
        type: FRAME_STATUS_MESSAGE,
        requestId,
        status
      } satisfies FrameStatusReport)
    ).catch(() => {
      // Nothing is listening — the popup is closed and the background only
      // listens while it is resolving a toggle. The report simply goes nowhere.
    })
  } catch {
    // Some browsers throw instead of rejecting when there is no receiver.
  }
}
