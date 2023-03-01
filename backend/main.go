package main

import (
	"flag"
	"io/ioutil"
	"net"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"github.com/labstack/echo/middleware"

	"github.com/labstack/echo"
	"github.com/sirupsen/logrus"
)

var logger = logrus.New()

func main() {
	var socketPath string
	flag.StringVar(&socketPath, "socket", "/run/guest-services/kwasm.sock", "Unix domain socket to listen on")
	flag.Parse()

	_ = os.RemoveAll(socketPath)

	logger.SetOutput(os.Stdout)

	logMiddleware := middleware.LoggerWithConfig(middleware.LoggerConfig{
		Skipper: middleware.DefaultSkipper,
		Format: `{"time":"${time_rfc3339_nano}","id":"${id}",` +
			`"method":"${method}","uri":"${uri}",` +
			`"status":${status},"error":"${error}"` +
			`}` + "\n",
		CustomTimeFormat: "2006-01-02 15:04:05.00000",
		Output:           logger.Writer(),
	})

	logger.Infof("Starting listening on %s\n", socketPath)
	router := echo.New()
	router.HideBanner = true
	router.Use(logMiddleware)
	startURL := ""

	ln, err := listen(socketPath)
	if err != nil {
		logger.Fatal(err)
	}
	router.Listener = ln

	router.GET("/install", install)

	logger.Fatal(router.Start(startURL))
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}

func install(ctx echo.Context) error {
	b, err := ioutil.ReadFile(os.Getenv("NODE_ROOT") + "/etc/docker/daemon.json")
	if err != nil {
		panic(err)
	}
	s := string(b)
	// //check whether s contains substring text
	if !strings.Contains(s, "\"containerd-snapshotter\":true") {
		return ctx.JSON(http.StatusOK, HTTPMessageBody{Message: "Please go to settings > Features in development and enable \"Use containerd for pulling and storing images\"", Error: "containerd-snapshotter not enabled"})
	}

	//TODO move command to script file
	command := exec.Command("sh", "-c", "cp -r /assets /$NODE_ROOT/opt/kwasm && export CONTAINERD_PID=$(ps aux | grep 'containerd.toml$' | head -n 1 | awk '{print $1}') && nsenter -m/$NODE_ROOT/proc/$CONTAINERD_PID/ns/mnt -- sh -c 'cp -f /opt/kwasm/containerd-shim-* /usr/local/bin/'")
	out, err := command.CombinedOutput()
	if err != nil {
		return ctx.JSON(http.StatusOK, HTTPMessageBody{Message: string(out), Error: err.Error()})
	} else if len(out) == 0 {
		return ctx.JSON(http.StatusOK, HTTPMessageBody{Message: "OK"})
	} else {
		return ctx.JSON(http.StatusOK, HTTPMessageBody{Message: string(out)})
	}
}

type HTTPMessageBody struct {
	Message string
	Error   string
}
