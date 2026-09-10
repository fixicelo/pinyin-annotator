import { Storage } from "@plasmohq/storage"

import {
  DEFAULT_IGNORED_NODES,
  IS_ANNOTATED_ATTR,
  NON_CHINESE_CLASS,
  PronunciationSystem,
  ResponseStatus,
  RESULT_CLASS,
  RubyPosition,
  TAG_NAME,
  ToneType,
  UserAction,
  type HtmlOptions,
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
import { loadUserPreferences, saveUserPreferences } from "~lib/user-preferences"
import {
  buildAnnotatedFragment,
  clearAnnotation,
  findTextNodesWithContent,
  isAnnotated
} from "~util"

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
  private isProcessing = false

  private htmlOptions: HtmlOptions = {
    toneType: ToneType.Symbol
  }
  private observerOptions: MutationObserverInit = {
    attributes: false,
    characterData: true,
    childList: true,
    subtree: true
  }
  private observationTargetSelector: string = "body"
  private pendingMutations: MutationRecord[] = []
  private mutationFlushTimer: ReturnType<typeof setTimeout> | null = null
  private lastAppliedStyleKey = ""

  constructor() {
    this.mutationObserver = new MutationObserver((mutations) =>
      this.enqueueMutations(mutations)
    )
    chrome.runtime.onMessage.addListener(this.handleUserAction.bind(this))
    this.styleTag = document.createElement("style")
    document.head.appendChild(this.styleTag)
    this.init()
  }

  private async init() {
    await this.syncUserPreferences()
    if (this.autoAnnotate) {
      this.actionHandlers[UserAction.Annotate]()
    }
  }

  private getObservationTarget(): HTMLElement {
    return document.querySelector(this.observationTargetSelector)
  }

  public setObservationTarget(selector: string) {
    this.observationTargetSelector = selector
  }

  public setObserverOptions(options: MutationObserverInit) {
    if (JSON.stringify(this.observerOptions) === JSON.stringify(options)) {
      return
    }

    if (this.isObserverEnabled) {
      this.mutationObserver.disconnect()
    }
    this.observerOptions = options
    if (this.isObserverEnabled) {
      this.mutationObserver.observe(
        this.getObservationTarget(),
        this.observerOptions
      )
    }
  }

  private enqueueMutations(mutations: MutationRecord[]) {
    this.pendingMutations.push(...mutations)
    if (this.mutationFlushTimer !== null) {
      clearTimeout(this.mutationFlushTimer)
    }
    this.mutationFlushTimer = setTimeout(() => {
      this.mutationFlushTimer = null
      const merged = this.pendingMutations
      this.pendingMutations = []
      this.processDOMMutations(merged)
    }, 30)
  }

  private processDOMMutations(mutationsList: MutationRecord[]) {
    if (!this.isObserverEnabled) {
      return
    }

    const version = this.annotationVersion
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
        case "attributes":
          this.processNodes(mutation.target, this.htmlOptions, version)
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
    const nodes = await findTextNodesWithContent(root, this.cachedIgnoredNodes)

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

      const frag = buildAnnotatedFragment(node.textContent, htmlOptions)
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
        return
      }

      const version = ++this.annotationVersion
      this.isProcessing = true
      await this.processNodes(target, this.htmlOptions, version)
      if (version === this.annotationVersion) {
        this.isProcessing = false
      }

      if (this.isObserverEnabled && version === this.annotationVersion) {
        this.mutationObserver.observe(target, this.observerOptions)
      }
    },
    [UserAction.Clear]: () => {
      this.annotationVersion++
      this.isProcessing = false
      this.pendingMutations = []
      if (this.mutationFlushTimer !== null) {
        clearTimeout(this.mutationFlushTimer)
        this.mutationFlushTimer = null
      }
      if (this.isObserverEnabled) {
        this.mutationObserver.disconnect()
      }
      const target = this.getObservationTarget()
      if (target) {
        clearAnnotation(target)
      }
    },
    [UserAction.Toggle]: async () => {
      const root = this.getObservationTarget()
      if (!root) {
        return
      }
      const action =
        isAnnotated(root) || this.isProcessing
          ? UserAction.Clear
          : UserAction.Annotate
      await this.actionHandlers[action]()
    }
  }

  public handleUserAction(message, sender, sendResponse) {
    ;(async () => {
      try {
        const actionHandler = this.actionHandlers[message.action]
        if (actionHandler) {
          await actionHandler(message.data)
        }

        const target = this.getObservationTarget()
        const response = {
          status:
            target && isAnnotated(target)
              ? ResponseStatus.Annotated
              : ResponseStatus.NotAnnotated
        }
        sendResponse(response)
      } catch (error) {
        console.debug("Error handling user action:", error)
        sendResponse({ status: ResponseStatus.NotAnnotated })
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
