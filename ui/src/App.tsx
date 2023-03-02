import React from "react";
import Button from "@mui/material/Button";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import {
  Alert,
  Card,
  CardContent,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { KWasmLogo } from "./Logo";

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [response, setResponse] = React.useState<string>();
  const [installSuccess, setInstallSuccess] = React.useState<boolean>();
  const ddClient = useDockerDesktopClient();

  const installSpin = async () => {
    const result: any = await ddClient.extension.vm?.service?.get("/install");

    if (result["Error"] === "" && result["Message"] === "OK") {
      setInstallSuccess(true);
    } else {
      setResponse(JSON.stringify(result));
    }
  };

  const openURL = (url: string) => {
    ddClient.host.openExternal(url);
  };

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="stretch"
      >
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <a href="#" onClick={() => openURL("https://kwasm.sh")}>
              <KWasmLogo />
            </a>
            <Typography variant="h3">KWasm for Docker Desktop</Typography>
          </Stack>
          <Typography variant="body1">
            <b>
              KWasm is an installer for WebAssembly container runtimes. Visit{" "}
              <a href="#" onClick={() => openURL("https://kwasm.sh")}>
                KWasm.sh
              </a>
              .
            </b>
          </Typography>
        </Stack>
        <Stack direction="column" justifyContent="center" alignItems="flex-end">
          <Typography variant="body1">Star us on Github</Typography>
          <Typography variant="body1">
            Feel free to report any issues
          </Typography>
        </Stack>
      </Stack>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="body1">
            Docker Desktop already{" "}
            <a
              href="#"
              onClick={() => openURL("https://docs.docker.com/desktop/wasm/")}
            >
              supports Wasm conatainers
            </a>{" "}
            these are powered by the{" "}
            <a
              href="#"
              onClick={() => openURL("https://wasmedge.org/book/en/")}
            >
              wasmedge runtime
            </a>
            . But there are other types of Wasm containers e.g. based on{" "}
            <a
              href="#"
              onClick={() =>
                openURL("https://developer.fermyon.com/spin/index")
              }
            >
              Fermyon Spin
            </a>
            . This extension installes a containerd shim that can run Wasm
            containers powered by Spin.
          </Typography>
        </CardContent>
      </Card>
      <Stack direction="row" sx={{ mt: 3 }}>
        <Alert severity="warning" sx={{ width: 1 }}>
          The changes made during install are non-persistent. They dissapear
          when you restart Docker Desktop!
        </Alert>
        <Button onClick={installSpin}>Install Spin</Button>
      </Stack>
      <Alert
        severity="error"
        sx={{ width: 1, mt: 3, display: response ? undefined : "none" }}
      >
        Response: {response ?? ""}
      </Alert>
      <Alert
        severity="success"
        sx={{ width: 1, mt: 3, display: installSuccess ? undefined : "none" }}
      >
        Installation finished without error!
      </Alert>
      <Card sx={{ display: installSuccess ? undefined : "none" }}>
        <CardContent>
          <Typography>Try to start your first Spin container:</Typography>
          <TextField
            id="outlined-basic"
            variant="outlined"
            disabled={true}
            sx={{ width: 1 }}
            value="docker run -d --platform wasi/wasm --runtime io.containerd.spin.v1 -p 8080:80 --network=default ghcr.io/deislabs/containerd-wasm-shims/examples/spin-rust-hello:latest /"
          />
          <TextField
            id="outlined-basic"
            variant="outlined"
            disabled={true}
            sx={{ width: 1 }}
            value="curl localhost:8080/hello"
          />
          <Typography sx={{ mt: 3 }}>
            Create your own Spin images with{" "}
            <a
              href=""
              onClick={() =>
                openURL(
                  "https://github.com/deislabs/containerd-wasm-shims/blob/main/containerd-shim-spin-v1/quickstart.md#create-a-new-spin-sample-application"
                )
              }
            >
              the quickstart guide
            </a>
            !
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}
