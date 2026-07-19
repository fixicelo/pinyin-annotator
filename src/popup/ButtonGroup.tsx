import React, { useCallback } from 'react';
import { UserAction } from '~constants';

interface ButtonGroupProps {
  isAnnotated: boolean;
  communicateWithContentScript: (action: UserAction, payload?: any) => void;
  disabled?: boolean;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ isAnnotated, communicateWithContentScript, disabled = false }) => {
  const performAnnotation = useCallback(() => communicateWithContentScript(UserAction.Annotate), [communicateWithContentScript]);
  const removeAnnotations = useCallback(() => communicateWithContentScript(UserAction.Clear), [communicateWithContentScript]);

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="flex gap-md justify-end">
      <button className="btn btn-text" onClick={openOptionsPage}>Options</button>
      <button className="btn btn-outlined" onClick={removeAnnotations} disabled={disabled || !isAnnotated}>Clear</button>
      <button className="btn btn-primary" onClick={performAnnotation} disabled={disabled}>Annotate</button>
    </div>
  );
};

export default ButtonGroup;