import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from "@mui/material/Typography";
import { useStorage } from "@plasmohq/storage/hook";
import React, { useCallback, useEffect, useState } from 'react';
import { PREDEFINED_DICT_LINK, StorageKey, ToneType } from '~constants';
import { debounce } from './util';

function Options() {
  const [toneType, setToneType] = useStorage<ToneType>(StorageKey.toneType, ToneType.Symbol);
  const [observerEnabled, setObserverEnabled] = useStorage<boolean>(StorageKey.observerEnabled, true);
  const [ignoredNodes, setIgnoredNodes] = useStorage<string[]>(StorageKey.ignoredNodes, []);
  const [ignoredNodesInput, setIgnoredNodesInput] = useState(ignoredNodes.join(','));
  const [notification, setNotification] = useState<string | null>(null);
  const [dictLinkEnabled, setDictLinkEnabled] = useStorage<boolean>(StorageKey.dictLinkEnabled, true);
  const [selectedDict, setSelectedDict] = useStorage<string>(StorageKey.selectedDict, PREDEFINED_DICT_LINK[0].site);
  const [customDictUrl, setCustomDictUrl] = useStorage<string>(StorageKey.customDictUrl, "");

  const handleToneTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToneType(event.target.checked ? ToneType.Symbol : ToneType.None);
  };

  const handleObserverEnabledChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setObserverEnabled(event.target.checked);
  };

  const debouncedSetIgnoredNodes = useCallback(
    debounce((newIgnoredNodesInput: string) => {
      const newIgnoredNodes = newIgnoredNodesInput.split(',').map(node => node.trim()).filter(Boolean);
      setIgnoredNodes(newIgnoredNodes);
      setNotification('Auto-saved');
      setTimeout(() => setNotification(null), 2000); // Clear notification after 2 seconds
    }, 1000),
    []
  );

  const handleIgnoredNodesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newIgnoredNodesInput = event.target.value.trim().toUpperCase();
    setIgnoredNodesInput(newIgnoredNodesInput);
    debouncedSetIgnoredNodes(newIgnoredNodesInput);
  };

  const handleDictLinkToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDictLinkEnabled(event.target.checked);
  };

  const handleDictChange = (event: SelectChangeEvent<string>) => {
    setSelectedDict(event.target.value);
  };

  const handleCustomDictUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDictUrl(event.target.value);
  };

  useEffect(() => {
    setIgnoredNodesInput(ignoredNodes.join(','));
  }, [ignoredNodes]);

  return (
    <Container maxWidth="md" sx={{ padding: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', marginBottom: 2 }}>
          Pinyin Annotator Options
        </Typography>
        <Box mt={2}>
          <FormControlLabel
            control={<Switch checked={observerEnabled} onChange={handleObserverEnabledChange} />}
            label="Monitor mode"
          />
        </Box>

        <Box mt={2}>
          <FormControlLabel
            control={<Switch checked={toneType === ToneType.Symbol} onChange={handleToneTypeChange} />}
            label="Tone marks (ā á ǎ à)"
          />
        </Box>

          <Box mt={2} mb={2}>

        <Tooltip
          title="Add a link to an online dictionary for each word in `Selected Text` area."
          placement="right"
          style={{ fontFamily: "LXGW WenKai Mono" }}
        >
            <FormControlLabel
              control={<Switch checked={dictLinkEnabled} onChange={handleDictLinkToggle} />}
              label="Dictionary Link"
            />
        </Tooltip>
          </Box>
        {dictLinkEnabled && (
          <FormControl fullWidth>
            <InputLabel id="options-select-dict">Select Dictionary</InputLabel>
            <Select
              labelId="options-select-dict"
              label="Select Dictionary"
              value={selectedDict}
              onChange={handleDictChange}
            >
              {PREDEFINED_DICT_LINK.map((dict) => (
                <MenuItem key={dict.site} value={dict.site}>
                  {dict.desc}
                </MenuItem>
              ))}
            </Select>
            {selectedDict === "custom" && (
              <TextField
                label="Custom Dictionary URL"
                value={customDictUrl}
                onChange={handleCustomDictUrlChange}
                helperText="Use {word} as a placeholder for the selected word"
                fullWidth
                margin="normal"
              />
            )}
          </FormControl>
        )}


        <Typography variant="h6" gutterBottom sx={{ marginTop: 6 }} color={'dimgray'}>
          Advanced options
        </Typography>
        <Box>
          <TextField
            label="Enter the tag names of nodes to ignore (separated by commas)"
            value={ignoredNodesInput}
            onChange={handleIgnoredNodesChange}
            helperText="Leave blank to use the default: TEXTAREA,CODE,PRE,KBD,INPUT,RP,RT,RUBY,SCRIPT,STYLE"
            fullWidth
            margin="normal"
          />
          {notification && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {notification}
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default Options;