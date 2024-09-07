import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from "@mui/material/Typography";
import { useStorage } from "@plasmohq/storage/hook";
import parse from 'html-react-parser';
import { memo, useCallback, useEffect, useState } from 'react';
import { ResponseStatus, StorageKey, ToneType, UserAction, type Response, type UserPreferences } from '~constants';
import { convertTextContentToHtml } from '~util';
import './popup.css';

const AppTitle = memo(({ toneType }: { toneType: ToneType }) => {

  const withTones = toneType === ToneType.Symbol;

  return (
    <Typography
      variant="h4"
      gutterBottom
      textAlign={'center'}
      style={{ fontFamily: "LXGW WenKai Mono" }}
    >
      {/* 
      <ruby>漢<rp>(</rp><rt>{withTones ? 'hàn' : 'han'}</rt><rp>)</rp></ruby>
      <ruby>語<rp>(</rp><rt>{withTones ? 'yǔ' : 'yu'}</rt><rp>)</rp></ruby> 
      */}
      <ruby>拼<rp>(</rp><rt>{withTones ? 'pīn' : 'pin'}</rt><rp>)</rp></ruby>
      <ruby>音<rp>(</rp><rt>{withTones ? 'yīn' : 'yin'}</rt><rp>)</rp></ruby>
      <ruby>標<rp>(</rp><rt>{withTones ? 'biāo' : 'biao'}</rt><rp>)</rp></ruby>
      <ruby>註<rp>(</rp><rt>{withTones ? 'zhù' : 'zhu'}</rt><rp>)</rp></ruby>
      <ruby>工<rp>(</rp><rt>{withTones ? 'gōng' : 'gong'}</rt><rp>)</rp></ruby>
      <ruby>具<rp>(</rp><rt>{withTones ? 'jù' : 'ju'}</rt><rp>)</rp></ruby>
    </Typography>
  )
});

const AnnotationStatus = memo(({ isAnnotated }: { isAnnotated: boolean }) => (
  <p className={`status ${isAnnotated ? 'annotated' : 'not-annotated'}`}>
    Status: {isAnnotated ? 'Annotated' : 'Not annotated / Not applicable'}
  </p>
));

function getSelectionText(removeAnnotations: boolean = true) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  if (!removeAnnotations) {
    return selection.toString();
  }

  const range = selection.getRangeAt(0);
  const clonedSelection = range.cloneContents();
  const div = document.createElement('div');
  div.appendChild(clonedSelection);
  const rps = div.getElementsByTagName('rp');
  const rts = div.getElementsByTagName('rt');
  while (rps.length) {
    rps[0].parentNode.removeChild(rps[0]);
  }
  while (rts.length) {
    rts[0].parentNode.removeChild(rts[0]);
  }
  return div.textContent;
}

const retrieveHighlightedText = (setSelectedText) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0].id) return;
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: getSelectionText,
    }, function (results) {
      if (chrome.runtime.lastError) {
        console.info(chrome.runtime.lastError);
      } else {
        const text = results[0].result
        if (text?.trim().length > 0) {
          setSelectedText(text);
        }
      }
    });
  });
};

const HighlightedTextDisplay = memo(({ toneType }: { toneType: ToneType }) => {
  const [selectedText, setSelectedText] = useState("");
  const htmlString = convertTextContentToHtml(selectedText, { toneType })
  const fontSizePx = 40
  const lineHeightPx = fontSizePx + 30

  useEffect(() => {
    retrieveHighlightedText(setSelectedText)
  }, [retrieveHighlightedText]);

  return (selectedText &&
    <>
      <Divider><Chip label="Annotated selected text" size="medium" /></Divider>
      <span style={{ fontSize: `${fontSizePx}px`, lineHeight: `${lineHeightPx}px` }}>
        {parse(htmlString)}
      </span>
    </>)
})

function Popup() {
  const [isAnnotated, setIsAnnotated] = useState(false);
  const [toneType, setToneType] = useStorage<ToneType>(StorageKey.toneType, ToneType.Symbol)
  const [observerEnabled, setObserverEnabled] = useStorage<boolean>(StorageKey.observerEnabled, true);

  const communicateWithContentScript = useCallback(async (action: UserAction, data: UserPreferences = {}) => {
    try {
      const tabs = await new Promise<chrome.tabs.Tab[]>((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(tabs);
          }
        });
      });

      const response = await new Promise<Response>((resolve, reject) => {
        chrome.tabs.sendMessage(tabs[0].id, { action, data }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });

      if (response) {
        setIsAnnotated(response.status === ResponseStatus.Annotated);
      }
    } catch (error) {
      console.info('Error communicating with content script:', error);
    }
  }, []);

  const handleToneTypeChange = useCallback((isChecked: boolean) => {
    const newToneType = isChecked ? ToneType.Symbol : ToneType.None;
    setToneType(newToneType);
    communicateWithContentScript(UserAction.UpdateOptions, { toneType: newToneType });
  }, [setToneType, communicateWithContentScript]);

  const handleObserverEnabledChange = useCallback((isChecked: boolean) => {
    setObserverEnabled(isChecked);
    communicateWithContentScript(UserAction.UpdateOptions, { observerEnabled: isChecked });
  }, [setObserverEnabled, communicateWithContentScript]);

  const performAnnotation = useCallback(() => communicateWithContentScript(UserAction.Annotate), [communicateWithContentScript]);
  const removeAnnotations = useCallback(() => communicateWithContentScript(UserAction.Clear), [communicateWithContentScript]);

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  useEffect(() => {
    communicateWithContentScript(UserAction.Check, {});
  }, [communicateWithContentScript]);

  return (
    <Box className="popup">
      <AppTitle toneType={toneType} />
      <AnnotationStatus isAnnotated={isAnnotated} />

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body1" style={{ fontFamily: "LXGW WenKai Mono" }}>Tone marks (ā á ǎ à)</Typography>
        <Switch checked={toneType === ToneType.Symbol} onChange={e => handleToneTypeChange(e.target.checked)} />
      </Stack>
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

      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>
        <Button sx={{ textTransform: 'none' }} onClick={openOptionsPage} variant={"text"}>Options</Button>
        <Button sx={{ textTransform: 'none' }} onClick={removeAnnotations} variant={"outlined"} disabled={!isAnnotated}>Clear</Button>
        <Button sx={{ textTransform: 'none' }} onClick={performAnnotation} variant={"contained"}>Annotate</Button>
      </Stack>

      <HighlightedTextDisplay toneType={toneType} />

    </Box>
  );
}

export default Popup;