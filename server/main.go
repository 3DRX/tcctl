package main

import (
	"fmt"
	"log"
	// "os"

	// "github.com/florianl/go-tc"
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

	type NetemForm struct {
		NIC   string `form:"NIC" binding:"required"`
		Delay int    `form:"delay" binding:"required"`
		Loss  int    `form:"loss" binding:"required"`
		Rate  int    `form:"rate" binding:"required"`
	}

	r.PUT("/api/v2/netem", func(c *gin.Context) {
		var form NetemForm
		if err := c.Bind(&form); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		fmt.Println(form)
		// TODO: implement netem
		// rtnl, err := tc.Open(&tc.Config{})
		// if err != nil {
		// 	c.JSON(500, err)
		// 	return
		// }
		// defer func() {
		// 	if err := rtnl.Close(); err != nil {
		// 		c.JSON(500, err)
		// 	}
		// }()
		// qdiscs, err := rtnl.Qdisc().Get()
		// if err != nil {
		// 	c.JSON(500, err)
		// 	return
		// }
		c.Status(200)
	})

	r.Run(":8080")
}
