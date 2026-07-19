import { useStorage } from "@plasmohq/storage/hook";
import React from 'react';
import { StorageKey, UserAction } from '~constants';

interface MonitorModeOptionProps {
  communicateWithContentScript: (action: UserAction, data?: any) => void
}

const MonitorModeOption: React.FC<MonitorModeOptionProps> = ({
  communicateWithContentScript
}) => {
  const [observerEnabled, setObserverEnabled] = useStorage<boolean>(StorageKey.observerEnabled, true);

  const handleObserverEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setObserverEnabled(isChecked);
    communicateWithContentScript(UserAction.UpdateOptions, { observerEnabled: isChecked });
  };

  return (
    <div 
      className="flex items-center justify-between" 
      style={{ padding: "12px 0", borderBottom: "1px solid var(--border-color)" }}
      title="Monitor mode works with CC (subtitles) on video streaming platforms such as Netflix, Disney+, YouTube, and Bilibili."
    >
      <span className="text-strong" style={{ fontSize: "13px" }}>Monitor mode</span>
      <label className="switch">
        <input 
          type="checkbox" 
          checked={observerEnabled} 
          onChange={handleObserverEnabledChange} 
        />
        <span className="switch-slider"></span>
      </label>
    </div>
  );
};

export default MonitorModeOption;