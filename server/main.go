package main

import (
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/3DRX/tcctl/server/logger"
	"github.com/3DRX/tcctl/server/netem"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	sloggin "github.com/samber/slog-gin"
	"github.com/shirou/gopsutil/v3/net"
)

func main() {
	args := os.Args[1:]
	isProd := false
	config := cors.DefaultConfig()
	logger := logger.GetInstance()
	if len(args) != 0 && args[0] == "prod" {
		gin.SetMode(gin.ReleaseMode)
		isProd = true
		gin.DisableConsoleColor()
	} else {
		fmt.Println("Running in dev mode, use 'tcctl prod' to run in release mode")
		config.AllowOrigins = []string{"http://localhost:5173"}
	}
	r := gin.Default()
	if !isProd {
		r.Use(cors.New(config))
	}
	r.Use(sloggin.New(logger))
	r.Use(gin.Recovery())

	r.Static("/", "./dist")

	r.POST("/api/v2/interfaces", func(c *gin.Context) {
		counters, err := net.IOCounters(true)
		if err != nil {
			logger.Error(err.Error())
			c.JSON(500, err.Error())
			return
		}
		retVal := make(map[string][]int64)
		for _, counter := range counters {
			retVal[counter.Name] = []int64{
				int64(counter.BytesSent),
				int64(counter.BytesRecv),
			}
		}
		c.JSON(200, retVal)
	})

	r.POST("/api/v2/bufferstate", func(c *gin.Context) {
		var form netem.BufferStateForm
		if err := c.Bind(&form); err != nil {
			c.JSON(400, err.Error())
			return
		}
		bufferState, err := netem.GetBufferState(&form)
		if err != nil {
			c.JSON(500, err.Error())
			return
		}
		c.JSON(200, bufferState)
	})

	r.PUT("/api/v2/netem", func(c *gin.Context) {
		var form netem.NetemForm
		if err := c.Bind(&form); err != nil {
			c.JSON(400, err.Error())
			return
		}
		controller := netem.GetController()
		err := controller.ExecuteNetem(&form)
		if err != nil {
			c.JSON(500, err.Error())
			return
		}
		c.JSON(200, "ok")
	})

	c := make(chan os.Signal)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		cleanup()
		os.Exit(1)
	}()

	r.Run(":8080")
}

func cleanup() {
	controller := netem.GetController()
	if controller == nil {
		return
	}
	err := controller.UnsetAllNetem()
	if len(err) != 0 {
		logger := logger.GetInstance()
		logger.Error(
			strings.Join(err, ", ") +
				". Please consider reboot or manually unset all tc qdisc rules",
		)
	}
}
