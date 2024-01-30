package main

import (
	"fmt"
	"log"
	"os"

	"github.com/3DRX/tcctl/server/netem"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/v3/net"
)

func main() {
	args := os.Args[1:]
	fmt.Println(args)
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
		retVal := make(map[string][]int64)
		for _, counter := range counters {
			retVal[counter.Name] = []int64{int64(counter.BytesSent), int64(counter.BytesRecv)}
		}
		if err != nil {
			log.Fatal(err)
			c.JSON(500, err)
			return
		}
		c.JSON(200, retVal)
	})

	r.PUT("/api/v2/netem", func(c *gin.Context) {
		var form netem.NetemForm
		if err := c.Bind(&form); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		executor := netem.GetExecutor()
		err := executor.ExecuteNetem(form)
		if err != nil {
			c.JSON(500, err)
			return
		}
		c.Status(200)
	})

	r.Run(":8080")
}
