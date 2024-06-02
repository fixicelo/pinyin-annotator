import { Storage } from "@plasmohq/storage"

import {
  IGNORED_NODES,
  ResponseStatus,
  StorageKey,
  ToneType,
  UserAction,
  type HtmlOptions,
  type UserPreferences
} from "~constants"
import {
  clearAnnotation,
  convertHtmlToDocument,
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
  }

  private getObservationTarget(): HTMLElement {
    return document.querySelector(this.observationTargetSelector)
  }

  public setObservationTarget(selector: string) {
    this.observationTargetSelector = selector
  }

  public setObserverOptions(options: MutationObserverInit) {
    if (JSON.stringify(this.observerOptions) !== JSON.stringify(options)) {
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

    for (let mutation of mutationsList) {
      switch (mutation.type) {
        case "childList":
          for (let node of mutation.addedNodes) {
            if (IGNORED_NODES.includes(node.nodeName)) {
              continue
            }
            this.processNodes(node, this.htmlOptions)
          }
          break
        case "characterData":
          this.processNodes(mutation.target.parentElement, this.htmlOptions)
          break
        case "attributes":
          this.processNodes(mutation.target, this.htmlOptions)
          break
      }
    }
  }

  private async getUserPreferencesFromStorage(): Promise<UserPreferences> {
    const [toneTypeResult, observerEnabledResult] = await Promise.all([
      this.storage.get(StorageKey.toneType),
      this.storage.get(StorageKey.observerEnabled)
    ])

    return {
      toneType: toneTypeResult as ToneType,
      observerEnabled: observerEnabledResult as unknown as boolean
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
            : true
    }

    await this.updateUserPreferencesInStorage(updatedPreferences)

    this.htmlOptions = {
      ...this.htmlOptions,
      toneType: updatedPreferences.toneType
    }
    this.isObserverEnabled = updatedPreferences.observerEnabled
  }

  private async requestAnnotation(text: string, htmlOptions: HtmlOptions) {
    return chrome.runtime.sendMessage({
      action: "requestAnnotation",
      text,
      htmlOptions
    })
  }

  private async processNodes(root: Node, htmlOptions: HtmlOptions) {
    const nodes = findTextNodesWithContent(root)

    for (const node of nodes) {
      if (!node.isConnected) {
        return
      }

      const response = await this.requestAnnotation(
        node.textContent,
        htmlOptions
      )
      const doc = convertHtmlToDocument(response.html)

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

      await this.processNodes(this.getObservationTarget(), this.htmlOptions)

      if (this.isObserverEnabled) {
        this.mutationObserver.observe(
          this.getObservationTarget(),
          this.observerOptions
        )
      }
    },
    [UserAction.Clear]: () => {
      if (this.isObserverEnabled) {
        this.mutationObserver.disconnect()
      }
      clearAnnotation(this.getObservationTarget())
    },
    [UserAction.Toggle]: async () => {
      const root = this.getObservationTarget()
      const action = isAnnotated(root) ? UserAction.Clear : UserAction.Annotate
      await this.actionHandlers[action]()
    }
  }

  public handleUserAction(message, sender, sendResponse) {
    ;(async () => {
      const actionHandler = this.actionHandlers[message.action]
      if (actionHandler) {
        await actionHandler(message.data)
      }

      const response = {
        status: isAnnotated(this.getObservationTarget())
          ? ResponseStatus.Annotated
          : ResponseStatus.NotAnnotated
      }
      sendResponse(response)
    })()
    return true
  }
}

const annotator = new Annotator()
