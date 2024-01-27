package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/v3/net"
)

func main() {
	r := gin.Default()

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

	r.Run(":8080")
}
