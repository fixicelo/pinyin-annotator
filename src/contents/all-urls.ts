import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import {
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
  private styleTag: HTMLStyleElement

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
            if (TAG_NAME.toUpperCase() === node.nodeName) {
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
    const [
      toneTypeResult,
      observerEnabledResult,
      rubyPositionResult,
      autoAnnotateResult
    ] = await Promise.all([
      this.storage.get(StorageKey.toneType),
      this.storage.get(StorageKey.observerEnabled),
      this.storage.get(StorageKey.rubyPosition),
      this.storage.get(StorageKey.autoAnnotate)
    ])

    return {
      toneType: toneTypeResult as ToneType,
      observerEnabled: observerEnabledResult as unknown as boolean,
      rubyPosition: rubyPositionResult as RubyPosition,
      autoAnnotate: autoAnnotateResult as unknown as boolean
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
  }

  private updateStyle(rubyPosition: RubyPosition) {
    this.styleTag.innerHTML = `
      ${TAG_NAME} {
        ruby-position: ${rubyPosition};
      }
    `
  }

  private async requestAnnotation(text: string, htmlOptions: HtmlOptions) {
    return await sendToBackground({
      name: "request-annotation",
      body: {
        text,
        htmlOptions
      }
    })
  }

  private async processNodes(root: Node, htmlOptions: HtmlOptions) {
    const nodes = await findTextNodesWithContent(root)

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

      const target = this.getObservationTarget()
      if (!target) {
        return
      }

      await this.processNodes(target, this.htmlOptions)

      if (this.isObserverEnabled) {
        this.mutationObserver.observe(target, this.observerOptions)
      }
    },
    [UserAction.Clear]: () => {
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
