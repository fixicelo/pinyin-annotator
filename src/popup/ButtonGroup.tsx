import { Button, Flex } from "antd";
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
    <Flex gap="middle" justify="flex-end">
      <Button onClick={openOptionsPage} variant={"text"} color={"primary"}>Options</Button>
      <Button onClick={removeAnnotations} variant={"outlined"} disabled={!isAnnotated}>Clear</Button>
      <Button onClick={performAnnotation} type={"primary"}  >Annotate</Button>
    </Flex>
  );
};

export default ButtonGroup;