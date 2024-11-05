import { useStorage } from "@plasmohq/storage/hook";
import { Flex, Switch, Tooltip, Typography } from 'antd';
import React from 'react';
import { StorageKey, UserAction } from '~constants';
import useCommunicateWithContentScript from './useCommunicateWithContentScript';

const { Text } = Typography;

const MonitorModeOption: React.FC = () => {
  const [observerEnabled, setObserverEnabled] = useStorage<boolean>(StorageKey.observerEnabled, true);

  const communicateWithContentScript = useCommunicateWithContentScript()

  const handleObserverEnabledChange = (isChecked: boolean) => {
    setObserverEnabled(isChecked);
    communicateWithContentScript(UserAction.UpdateOptions, { observerEnabled: isChecked });
  };

  return (
    <Tooltip
      title="Monitor mode works with CC (subtitles) on video streaming platforms such as Netflix, Disney+, YouTube, and Bilibili."
      placement="bottom"
      style={{ fontFamily: "LXGW WenKai Mono" }}
    >
      <Flex align="center" justify="space-between">
        <Text style={{ fontFamily: "LXGW WenKai Mono" }}>Monitor mode</Text>
        <Switch checked={observerEnabled} onChange={(checked) => handleObserverEnabledChange(checked)} />
      </Flex>
    </Tooltip>
  );
};

export default MonitorModeOption;