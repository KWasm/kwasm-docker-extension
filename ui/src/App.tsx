import React from 'react';
import Button from '@mui/material/Button';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Alert, Grid, Typography } from '@mui/material';

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [response, setResponse] = React.useState<string>();
  const ddClient = useDockerDesktopClient();

  const fetchAndDisplayResponse = async () => {
    const result = await ddClient.extension.vm?.service?.get('/install');
    setResponse(JSON.stringify(result));
  };

  return (
    <>
      <Typography variant="h3">KWasm for Docker Desktop</Typography>
      <Typography variant="body1">Docker Desktop already <a href='https://docs.docker.com/desktop/wasm/'>supports Wasm conatainers</a> these are powered by the <a href='https://wasmedge.org/book/en/'>wasmedge runtime</a>. But there are other types of Wasm containers e.g. based on <a href='https://developer.fermyon.com/spin/index'>Fermyon Spin</a>.</Typography>
      <Grid container spacing={2} sx={{ mt: 4 }}>
      <Alert severity="error" >Make sure you are using the latest version of Docker Desktop and the beta feature <b>"Use containerd for pulling and storing images"</b> is enabled!</Alert>
      <Alert severity="warning" >This will make a non-permanent change to your Docker VM. They are gone after restarting Docker Desktop!</Alert>
        <Button onClick={fetchAndDisplayResponse}>
          Install Spin
        </Button>
      </Grid>
      <div>{response ?? ''}</div>
    </>
  );
}
