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
import { clearAnnotation, isAnnotated, processNodes } from "~util"

type ActionHandlers = {
  [action in UserAction]?: (data?: any) => void
}

export class Annotator {
  private storage = new Storage()
  private mutationObserver: MutationObserver
  private isObserverEnabled = false
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
            processNodes(node, this.htmlOptions)
          }
          break
        case "characterData":
          processNodes(mutation.target.parentElement, this.htmlOptions)
          break
        case "attributes":
          processNodes(mutation.target, this.htmlOptions)
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

  private actionHandlers: ActionHandlers = {
    [UserAction.Check]: () => this.syncUserPreferences(),
    [UserAction.UpdateOptions]: (options: UserPreferences) =>
      this.syncUserPreferences(options),
    [UserAction.Annotate]: (options: UserPreferences) => {
      if (this.isObserverEnabled) {
        this.mutationObserver.disconnect()
      }
      this.isObserverEnabled = options.observerEnabled
      clearAnnotation(this.getObservationTarget())
      processNodes(this.getObservationTarget(), {
        ...this.htmlOptions,
        toneType: options.toneType
      })
      if (options.observerEnabled) {
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
    }
  }

  public handleUserAction(message, sender, sendResponse) {
    const actionHandler = this.actionHandlers[message.action]
    if (actionHandler) {
      actionHandler(message.data)
    }

    const response = {
      status: isAnnotated(this.getObservationTarget())
        ? ResponseStatus.Annotated
        : ResponseStatus.NotAnnotated
    }
    sendResponse(response)
    return true
  }
}

const annotator = new Annotator()
