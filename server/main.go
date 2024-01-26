package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/v3/net"
)

func main() {
	r := gin.Default()

	r.POST("/api/v2/interfaces", func(c *gin.Context) {
		counters, err := net.IOCounters(true)
		if err != nil {
			log.Fatal(err)
		}
		c.JSON(200, counters)
	})

	r.Run(":8080")
}
