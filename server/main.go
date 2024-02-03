package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/3DRX/tcctl/server/netem"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/v3/net"
)

func main() {
	args := os.Args[1:]
	isProd := false
	config := cors.DefaultConfig()
	if len(args) != 0 && args[0] == "prod" {
		gin.SetMode(gin.ReleaseMode)
		isProd = true
	} else {
		fmt.Println("Running in dev mode, use 'tcctl prod' to run in release mode")
		config.AllowOrigins = []string{"http://localhost:5173"}
	}
	r := gin.Default()
	if !isProd {
		r.Use(cors.New(config))
	}

	r.Static("/", "./dist")

	r.POST("/api/v2/interfaces", func(c *gin.Context) {
		counters, err := net.IOCounters(true)
		if err != nil {
			log.Fatal(err)
			c.JSON(500, err)
			return
		}
		retVal := make(map[string][]int64)
		for _, counter := range counters {
			retVal[counter.Name] = []int64{int64(counter.BytesSent), int64(counter.BytesRecv)}
		}
		c.JSON(200, retVal)
	})

	r.PUT("/api/v2/netem", func(c *gin.Context) {
		var form netem.NetemForm
		if err := c.Bind(&form); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		controller := netem.GetController()
		err := controller.ExecuteNetem(&form)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.Status(200)
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
	if err != nil {
		log.Fatal(
			err.Error(),
			", please consider reboot or manually unset all tc qdisc rules",
		)
	}
}
