import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React, { useCallback } from 'react';
import { UserAction } from '~constants';

interface ButtonGroupProps {
  isAnnotated: boolean;
  communicateWithContentScript: (action: UserAction, payload?: any) => void;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ isAnnotated, communicateWithContentScript }) => {
  const performAnnotation = useCallback(() => communicateWithContentScript(UserAction.Annotate), [communicateWithContentScript]);
  const removeAnnotations = useCallback(() => communicateWithContentScript(UserAction.Clear), [communicateWithContentScript]);

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>
      <Button sx={{ textTransform: 'none' }} onClick={openOptionsPage} variant={"text"}>Options</Button>
      <Button sx={{ textTransform: 'none' }} onClick={removeAnnotations} variant={"outlined"} disabled={!isAnnotated}>Clear</Button>
      <Button sx={{ textTransform: 'none' }} onClick={performAnnotation} variant={"contained"}>Annotate</Button>
    </Stack>
  );
};

export default ButtonGroup;