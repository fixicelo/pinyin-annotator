import { useStorage } from "@plasmohq/storage/hook"
import { Flex, Switch, Tooltip, Typography } from "antd"
import React from "react"

import { StorageKey, UserAction } from "~constants"

import useCommunicateWithContentScript from "./useCommunicateWithContentScript"

const { Text } = Typography

const AutoAnnotateOption: React.FC = () => {
  const [autoAnnotate, setAutoAnnotate] = useStorage<boolean>(
    StorageKey.autoAnnotate,
    false
  )

  const communicateWithContentScript = useCommunicateWithContentScript()

  const handleAutoAnnotateChange = (isChecked: boolean) => {
    setAutoAnnotate(isChecked)
    communicateWithContentScript(UserAction.UpdateOptions, {
      autoAnnotate: isChecked
    })
  }

  return (
    <Tooltip
      title="Automatically annotate pinyin on every page load."
      placement="bottom"
      style={{ fontFamily: "LXGW WenKai Mono" }}>
      <Flex align="center" justify="space-between">
        <Text style={{ fontFamily: "LXGW WenKai Mono" }}>Auto-Annotate</Text>
        <Switch
          checked={autoAnnotate}
          onChange={(checked) => handleAutoAnnotateChange(checked)}
        />
      </Flex>
    </Tooltip>
  )
}

export default AutoAnnotateOption
