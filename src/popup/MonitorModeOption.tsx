import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useStorage } from "@plasmohq/storage/hook";
import React from 'react';
import { StorageKey, UserAction } from '~constants';
import useCommunicateWithContentScript from './useCommunicateWithContentScript';

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
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body1" style={{ fontFamily: "LXGW WenKai Mono" }}>Monitor mode</Typography>
        <Switch checked={observerEnabled} onChange={e => handleObserverEnabledChange(e.target.checked)} />
      </Stack>
    </Tooltip>
  );
};

export default MonitorModeOption;