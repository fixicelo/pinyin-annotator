import { Storage } from "@plasmohq/storage"

import {
  DEFAULT_IGNORED_NODES,
  ResponseStatus,
  RubyPosition,
  StorageKey,
  TAG_NAME,
  ToneType,
  UserAction,
  type HtmlOptions,
  type UserPreferences
} from "~constants"
import {
  clearAnnotation,
  convertHtmlToDocument,
  convertTextContentToHtml,
  findTextNodesWithContent,
  isAnnotated,
  replaceNode
} from "~util"

type ActionHandlers = {
  [action in UserAction]?: (data?: any) => void
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
    wrapNonChinese: true,
    toneType: ToneType.Symbol
  }
  private observerOptions: MutationObserverInit = {
    attributes: false,
    characterData: true,
    childList: true,
    subtree: true
  }
  private observationTargetSelector: string = "body"

  constructor() {
    this.mutationObserver = new MutationObserver(
      this.processDOMMutations.bind(this)
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

  private processDOMMutations(
    mutationsList: MutationRecord[],
    observer: MutationObserver
  ) {
    if (!this.isObserverEnabled) {
      return
    }

    const version = this.annotationVersion
    for (let mutation of mutationsList) {
      switch (mutation.type) {
        case "childList":
          for (let node of mutation.addedNodes) {
            if (TAG_NAME.toUpperCase() === node.nodeName) {
              continue
            }
            this.processNodes(node, this.htmlOptions, version)
          }
          break
        case "characterData":
          this.processNodes(mutation.target.parentElement, this.htmlOptions, version)
          break
        case "attributes":
          this.processNodes(mutation.target, this.htmlOptions, version)
          break
      }
    }
  }

  private async getUserPreferencesFromStorage(): Promise<UserPreferences & { ignoredNodes: string[] }> {
    const [
      toneTypeResult,
      observerEnabledResult,
      rubyPositionResult,
      autoAnnotateResult,
      ignoredNodesResult
    ] = await Promise.all([
      this.storage.get(StorageKey.toneType),
      this.storage.get(StorageKey.observerEnabled),
      this.storage.get(StorageKey.rubyPosition),
      this.storage.get(StorageKey.autoAnnotate),
      this.storage.get<string[]>(StorageKey.ignoredNodes)
    ])

    return {
      toneType: toneTypeResult as ToneType,
      observerEnabled: observerEnabledResult as unknown as boolean,
      rubyPosition: rubyPositionResult as RubyPosition,
      autoAnnotate: autoAnnotateResult as unknown as boolean,
      ignoredNodes: (ignoredNodesResult as string[]) || []
    }
  }

  private async updateUserPreferencesInStorage(options: UserPreferences) {
    if (options?.toneType !== undefined) {
      await this.storage.set(StorageKey.toneType, options.toneType)
    }
    if (options?.observerEnabled !== undefined) {
      await this.storage.set(
        StorageKey.observerEnabled,
        options.observerEnabled
      )
    }
    if (options?.autoAnnotate !== undefined) {
      await this.storage.set(StorageKey.autoAnnotate, options.autoAnnotate)
    }
  }

  public async syncUserPreferences(options: UserPreferences = {}) {
    const storedPreferences = await this.getUserPreferencesFromStorage()

    const updatedPreferences = {
      toneType:
        options.toneType || storedPreferences.toneType || ToneType.Symbol,
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
            : false
    }

    await this.updateUserPreferencesInStorage(updatedPreferences)
    this.updateStyle(updatedPreferences.rubyPosition)

    this.htmlOptions = {
      ...this.htmlOptions,
      toneType: updatedPreferences.toneType
    }
    this.isObserverEnabled = updatedPreferences.observerEnabled
    this.autoAnnotate = updatedPreferences.autoAnnotate

    const rawIgnored = storedPreferences.ignoredNodes
    this.cachedIgnoredNodes =
      rawIgnored.length === 0
        ? DEFAULT_IGNORED_NODES
        : [...rawIgnored, TAG_NAME.toUpperCase()]
  }

  private updateStyle(rubyPosition: RubyPosition) {
    this.styleTag.innerHTML = `
      ${TAG_NAME} {
        ruby-position: ${rubyPosition};
      }
    `
  }

  private async processNodes(root: Node, htmlOptions: HtmlOptions, version: number) {
    const nodes = await findTextNodesWithContent(root, this.cachedIgnoredNodes)

    for (const node of nodes) {
      if (version !== this.annotationVersion) {
        return
      }

      if (!node.isConnected) {
        continue
      }

      const html = convertTextContentToHtml(node.textContent, htmlOptions)
      const doc = convertHtmlToDocument(html)

      replaceNode(node, doc, false)
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
      const action = (isAnnotated(root) || this.isProcessing) ? UserAction.Clear : UserAction.Annotate
      await this.actionHandlers[action]()
    }
  }

  public handleUserAction(message, sender, sendResponse) {
    ;(async () => {
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
    })()
    return true
  }
}

const annotator = new Annotator()
