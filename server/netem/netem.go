package netem

import (
// "os"
// "github.com/florianl/go-tc"
)

type NetemForm struct {
	NIC         string  `form:"NIC" binding:"required"`
	DelayMs     float64 `form:"delay" binding:"required"`
	LossPercent float64 `form:"loss" binding:"required"`
	RateKbps    float64 `form:"rate" binding:"required"`
}

type Executor struct {
	delayMs     float64
	lossPercent float64
	rateKbps    float64
}

var executor *Executor

func init() {
	executor = &Executor{}
}

func GetExecutor() *Executor {
	return executor
}

func (e *Executor) ExecuteNetem(form NetemForm) error {
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
	return nil
}
