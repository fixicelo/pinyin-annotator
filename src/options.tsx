import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Typography from "@mui/material/Typography";
import { useStorage } from "@plasmohq/storage/hook";
import React, { useCallback } from 'react';
import { StorageKey, ToneType } from '~constants';

function Options() {
  const [toneType, setToneType] = useStorage<ToneType>(StorageKey.toneType, ToneType.Symbol);
  const [observerEnabled, setObserverEnabled] = useStorage<boolean>(StorageKey.observerEnabled, true);

  const handleToneTypeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setToneType(event.target.checked ? ToneType.Symbol : ToneType.None);
  }, []);

  const handleObserverEnabledChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setObserverEnabled(event.target.checked);
  }, []);

  return (
    <Container maxWidth="md">
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
        <Grid item xs={12} sm={8} md={6}>
          <Paper elevation={3} style={{ padding: '2rem' }}>
            <Typography variant="h5" gutterBottom>Pinyin Annotator Options</Typography>
            <FormControlLabel
              control={<Switch checked={toneType === ToneType.Symbol} onChange={handleToneTypeChange} />}
              label="Tone marks (ā á ǎ à)"
            />
            <FormControlLabel
              control={<Switch checked={observerEnabled} onChange={handleObserverEnabledChange} />}
              label="Monitor mode"
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Options;