import type { PlasmoCSConfig } from "plasmo"

import { Storage } from "@plasmohq/storage"

import {
  DEFAULT_IGNORED_NODES,
  IS_ANNOTATED_ATTR,
  NON_CHINESE_CLASS,
  PronunciationSystem,
  ResponseStatus,
  RESULT_CLASS,
  RubyPosition,
  TAB_ANNOTATION_QUERY,
  TAG_NAME,
  ToneType,
  UserAction,
  type AnnotatorActionMessage,
  type HtmlOptions,
  type Response,
  type UserPreferences
} from "~constants"
import {
  ANNOTATION_SCALE_DEFAULT,
  clampAnnotationScale,
  getAnnotationFontSizeEm,
  getScaledTextFontSize,
  getScaledTextLineHeight,
  SCALE_TEXT_TOGETHER_DEFAULT
} from "~lib/annotation-scale"
import { buildCaptionBackdropCss } from "~lib/caption-styles"
import { reportFrameStatus } from "~lib/frame-status"
import { createMutationBatcher } from "~lib/mutation-batcher"
import { loadUserPreferences, saveUserPreferences } from "~lib/user-preferences"
import {
  buildAnnotatedFragment,
  clearAnnotation,
  createReadingContextCache,
  findReadingContext,
  findTextNodesWithContent,
  isAnnotated,
  markBackdropHost
} from "~util"

/**
 * Video captions normally live in a cross-origin player iframe — a separate
 * document the top frame can neither read nor annotate — so the annotator has
 * to be injected into every frame instead of the top document alone.
 */
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

type ActionHandlers = {
  [action in UserAction]?: (data?: UserPreferences) => void
}

export class Annotator {
  private storage = new Storage()
  private mutationObserver: MutationObserver
  private isObserverEnabled = true
  private autoAnnotate = false
  private cachedIgnoredNodes: string[] = DEFAULT_IGNORED_NODES
  private styleTag: HTMLStyleElement
  private annotationVersion = 0

  private htmlOptions: HtmlOptions = {
    toneType: ToneType.Symbol
  }
  private observerOptions: MutationObserverInit = {
    characterData: true,
    childList: true,
    subtree: true
  }
  private mutationBatcher = createMutationBatcher((mutations, version) =>
    this.processDOMMutations(mutations, version)
  )
  private lastAppliedStyleKey = ""

  constructor() {
    this.mutationObserver = new MutationObserver((mutations) =>
      this.mutationBatcher.push(mutations, this.annotationVersion)
    )
    chrome.runtime.onMessage.addListener(this.handleUserAction.bind(this))
    this.styleTag = document.createElement("style")
    document.head.appendChild(this.styleTag)
    this.init()
  }

  private async init() {
    await this.syncUserPreferences()
    if (this.autoAnnotate || (await this.isTabAnnotating())) {
      await this.actionHandlers[UserAction.Annotate]()
      // Nothing asked this document for an answer, but the toolbar icon follows
      // whatever ends up annotated, including a page annotated as it loads.
      this.reportStatus()
    }
  }

  /** Tells the background and the popup which state this frame ended up in. */
  private reportStatus(requestId?: number) {
    const target = this.getObservationTarget()
    reportFrameStatus(
      requestId,
      target && isAnnotated(target)
        ? ResponseStatus.Annotated
        : ResponseStatus.NotAnnotated
    )
  }

  /**
   * A frame that appears after the user asked for annotations — the player
   * iframe of a streaming site — never received that click, so it asks the
   * background whether its tab is annotating and joins in.
   */
  private async isTabAnnotating(): Promise<boolean> {
    try {
      const response = await chrome.runtime.sendMessage({
        type: TAB_ANNOTATION_QUERY
      })
      return Boolean(response?.annotating)
    } catch {
      // No background to answer, which is not worth failing startup over.
      return false
    }
  }

  /**
   * A frame can be asked to annotate before it has a body. Waiting for one
   * costs nothing and keeps the frame from starting idle.
   */
  private retryWhenDocumentReady() {
    if (document.readyState !== "loading") {
      return
    }

    const version = this.annotationVersion
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        if (version !== this.annotationVersion) {
          return
        }
        void this.actionHandlers[UserAction.Annotate]()
      },
      { once: true }
    )
  }

  private getObservationTarget(): HTMLElement {
    return document.querySelector("body")
  }

  private processDOMMutations(
    mutationsList: MutationRecord[],
    version: number
  ) {
    if (!this.isObserverEnabled) {
      return
    }

    for (const mutation of mutationsList) {
      switch (mutation.type) {
        case "childList":
          for (const node of mutation.addedNodes) {
            if (TAG_NAME.toUpperCase() === node.nodeName) {
              continue
            }
            this.processNodes(node, this.htmlOptions, version)
          }
          break
        case "characterData":
          this.processNodes(
            mutation.target.parentElement,
            this.htmlOptions,
            version
          )
          break
      }
    }
  }

  public async syncUserPreferences(options: UserPreferences = {}) {
    const storedPreferences = await loadUserPreferences(this.storage)

    const updatedPreferences = {
      toneType:
        options.toneType || storedPreferences.toneType || ToneType.Symbol,
      pronunciationSystem:
        options.pronunciationSystem ||
        storedPreferences.pronunciationSystem ||
        PronunciationSystem.Pinyin,
      observerEnabled:
        options.observerEnabled !== undefined
          ? options.observerEnabled
          : storedPreferences.observerEnabled !== undefined
            ? storedPreferences.observerEnabled
            : true,
      rubyPosition:
        options.rubyPosition ||
        storedPreferences.rubyPosition ||
        RubyPosition.OVER,
      autoAnnotate:
        options.autoAnnotate !== undefined
          ? options.autoAnnotate
          : storedPreferences.autoAnnotate !== undefined
            ? storedPreferences.autoAnnotate
            : false,
      annotationScale:
        options.annotationScale !== undefined
          ? clampAnnotationScale(options.annotationScale)
          : storedPreferences.annotationScale !== undefined
            ? clampAnnotationScale(storedPreferences.annotationScale)
            : ANNOTATION_SCALE_DEFAULT,
      scaleTextTogether:
        options.scaleTextTogether !== undefined
          ? options.scaleTextTogether
          : storedPreferences.scaleTextTogetherTouched
            ? storedPreferences.scaleTextTogether !== undefined
              ? storedPreferences.scaleTextTogether
              : SCALE_TEXT_TOGETHER_DEFAULT
            : SCALE_TEXT_TOGETHER_DEFAULT,
      scaleTextTogetherTouched:
        options.scaleTextTogetherTouched !== undefined
          ? options.scaleTextTogetherTouched
          : storedPreferences.scaleTextTogetherTouched !== undefined
            ? storedPreferences.scaleTextTogetherTouched
            : false
    }

    const shouldPersistPreferences =
      updatedPreferences.toneType !== storedPreferences.toneType ||
      updatedPreferences.pronunciationSystem !==
        storedPreferences.pronunciationSystem ||
      updatedPreferences.observerEnabled !==
        storedPreferences.observerEnabled ||
      updatedPreferences.rubyPosition !== storedPreferences.rubyPosition ||
      updatedPreferences.autoAnnotate !== storedPreferences.autoAnnotate ||
      updatedPreferences.annotationScale !==
        storedPreferences.annotationScale ||
      updatedPreferences.scaleTextTogether !==
        storedPreferences.scaleTextTogether ||
      updatedPreferences.scaleTextTogetherTouched !==
        storedPreferences.scaleTextTogetherTouched

    if (shouldPersistPreferences) {
      await saveUserPreferences(this.storage, updatedPreferences)
    }

    this.updateStyle(
      updatedPreferences.rubyPosition,
      updatedPreferences.annotationScale,
      updatedPreferences.scaleTextTogether
    )

    this.htmlOptions = {
      ...this.htmlOptions,
      toneType: updatedPreferences.toneType,
      pronunciationSystem: updatedPreferences.pronunciationSystem
    }
    this.isObserverEnabled = updatedPreferences.observerEnabled
    this.autoAnnotate = updatedPreferences.autoAnnotate

    const rawIgnored = storedPreferences.ignoredNodes
    this.cachedIgnoredNodes =
      rawIgnored.length === 0
        ? DEFAULT_IGNORED_NODES
        : [...rawIgnored, TAG_NAME.toUpperCase()]
  }

  private updateStyle(
    rubyPosition: RubyPosition,
    annotationScale: number,
    scaleTextTogether: boolean
  ) {
    const annotationFontSize = getAnnotationFontSizeEm(
      annotationScale,
      rubyPosition,
      scaleTextTogether
    )
    const scaledTextFontSize = getScaledTextFontSize(
      annotationScale,
      scaleTextTogether
    )
    const scaledTextLineHeight = getScaledTextLineHeight(
      annotationScale,
      rubyPosition,
      scaleTextTogether
    )
    const nextStyleKey = `${rubyPosition}:${annotationFontSize}:${scaledTextFontSize}:${scaledTextLineHeight}`
    if (this.lastAppliedStyleKey === nextStyleKey) {
      return
    }

    this.lastAppliedStyleKey = nextStyleKey
    const flexboxFallback =
      rubyPosition === RubyPosition.RIGHT
        ? `
      @supports not (ruby-position: inter-character) {
        .${RESULT_CLASS}[${IS_ANNOTATED_ATTR}] {
          display: inline-flex;
          align-items: center;
        }
        .${RESULT_CLASS}[${IS_ANNOTATED_ATTR}] ruby {
          display: contents;
        }
        .${RESULT_CLASS}[${IS_ANNOTATED_ATTR}] rt {
          display: inline-block;
          writing-mode: vertical-lr;
          text-orientation: upright;
          font-size: ${annotationFontSize};
          line-height: 1;
          padding-left: 1px;
        }
      }
    `
        : ""
    const captionBackdrop = buildCaptionBackdropCss(
      rubyPosition,
      annotationFontSize
    )
    this.styleTag.innerHTML = `
      ${TAG_NAME} {
        ruby-position: ${rubyPosition};
      }
      .${RESULT_CLASS}[${IS_ANNOTATED_ATTR}],
      .${NON_CHINESE_CLASS} {
        font-size: ${scaledTextFontSize};
        line-height: ${scaledTextLineHeight};
      }
      .${RESULT_CLASS}[${IS_ANNOTATED_ATTR}] rt {
        font-size: ${annotationFontSize};
      }
      ${flexboxFallback}
      ${captionBackdrop}
    `
  }

  /**
   * Yields to the main thread so the page can paint between chunks of work.
   *
   * requestAnimationFrame is the natural choice while the document is visible,
   * but it never fires while it is hidden. Waiting on it there stalls
   * annotation partway through a large page, leaves the action without a
   * response, and keeps the mutation observer detached, so a timer backs it up.
   */
  private yieldToMainThread(): Promise<void> {
    return new Promise((resolve) => {
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        resolve()
      }

      if (!document.hidden && typeof requestAnimationFrame === "function") {
        requestAnimationFrame(finish)
        // Also covers rAF being throttled for an occluded window.
        setTimeout(finish, 250)
        return
      }

      setTimeout(finish, 0)
    })
  }

  private async processNodes(
    root: Node,
    htmlOptions: HtmlOptions,
    version: number
  ) {
    const nodes = findTextNodesWithContent(root, this.cachedIgnoredNodes)
    // Readings are chosen from the block around each node, and the offsets are
    // shared between the nodes of one sweep instead of rebuilt for each.
    const readingContexts = createReadingContextCache()

    for (let i = 0; i < nodes.length; i++) {
      if (i > 0 && i % 80 === 0) {
        await this.yieldToMainThread()
      }

      if (version !== this.annotationVersion) {
        return
      }

      const node = nodes[i]
      if (!node.isConnected) {
        continue
      }

      // Done before the text node is replaced: the host is only recognisable
      // while it still holds nothing but text.
      markBackdropHost(node.parentElement)

      const frag = buildAnnotatedFragment(
        node.textContent,
        htmlOptions,
        findReadingContext(node, readingContexts)
      )
      if (node.parentNode) {
        node.parentNode.replaceChild(frag, node)
      }
    }
  }

  private actionHandlers: ActionHandlers = {
    [UserAction.Check]: async () => await this.syncUserPreferences(),
    [UserAction.UpdateOptions]: async (options: UserPreferences) =>
      await this.syncUserPreferences(options),
    [UserAction.Annotate]: async () => {
      await this.syncUserPreferences()
      this.actionHandlers[UserAction.Clear]()

      const target = this.getObservationTarget()
      if (!target) {
        this.retryWhenDocumentReady()
        return
      }

      const version = ++this.annotationVersion
      await this.processNodes(target, this.htmlOptions, version)

      if (this.isObserverEnabled && version === this.annotationVersion) {
        this.mutationObserver.observe(target, this.observerOptions)
      }
    },
    [UserAction.Clear]: () => {
      this.annotationVersion++
      this.mutationBatcher.cancel()
      if (this.isObserverEnabled) {
        this.mutationObserver.disconnect()
      }
      const target = this.getObservationTarget()
      if (target) {
        clearAnnotation(target)
      }
    }
  }

  public handleUserAction(
    message: AnnotatorActionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: Response) => void
  ) {
    const actionHandler = message?.action
      ? this.actionHandlers[message.action]
      : undefined
    if (!actionHandler) {
      // Not an action this version sends — a frame status report from another
      // frame, or a message from a newer version. Leave it unanswered.
      return false
    }

    ;(async () => {
      try {
        await actionHandler(message.data)

        const target = this.getObservationTarget()
        const response = {
          status:
            target && isAnnotated(target)
              ? ResponseStatus.Annotated
              : ResponseStatus.NotAnnotated
        }
        sendResponse(response)
        // tabs.sendMessage only delivers the first frame's response, so every
        // frame also reports itself for the popup and background to merge.
        this.reportStatus(message.requestId)
      } catch (error) {
        console.debug("Error handling user action:", error)
        sendResponse({ status: ResponseStatus.NotAnnotated })
        this.reportStatus(message.requestId)
      }
    })()
    return true
  }
}

function canAnnotateDocument(): boolean {
  try {
    const contentType = document.contentType
    if (contentType && !/html|xml/i.test(contentType)) {
      return false
    }
    return !!document.documentElement
  } catch {
    return false
  }
}

if (canAnnotateDocument()) {
  void new Annotator()
}
