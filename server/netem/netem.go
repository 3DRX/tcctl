package netem

import (
	"fmt"
	"log"
	"os/exec"
	"runtime"
	"strings"
)

// TODO: Implement the additional netem props
type NetemForm struct {
	// detailed props description:
	// https://man7.org/linux/man-pages/man8/tc-netem.8.html
	NIC                         string `binding:"required"`
	DelayMs                     float64
	DelayJitterMs               float64
	DelayCorrelationPercent     float64
	DelayDistribution           string // uniform(default), normal, pareto, paretonormal
	LossRandomPercent           float64
	LossStateP13                float64
	LossStateP31                float64
	LossStateP32                float64
	LossStateP23                float64
	LossStateP14                float64
	LossGEModelPercent          float64
	LossGEModelR                float64
	LossGEModel1H               float64
	LossGEModel1K               float64
	LossECN                     bool
	CorruptPercent              float64
	CorruptCorrelationPercent   float64
	DuplicatePercent            float64
	DuplicateCorrelationPercent float64
	ReorderPercent              float64
	ReorderCorrelationPercent   float64
	ReorderGapDistance          float64
	RateKbps                    float64 `binding:"required"`
	SlotMinDelayMs              float64
	SlotMaxDelayMs              float64
	SlotDistribution            string // uniform(default), normal, pareto, paretonormal
	SlotDelayJitterMs           float64
	SlotPackets                 int64
	SlotBytes                   int64
}

type Executor struct {
	nic         string
	delayMs     float64
	lossPercent float64
	rateKbps    float64
	first       bool
}

type Controller struct {
	NICExecutorMap map[string]*Executor
}

var controller *Controller

func init() {
	controller = &Controller{}
	log.Println("init controller")
	controller.NICExecutorMap = make(map[string]*Executor)
}

func GetController() *Controller {
	return controller
}

func (c *Controller) UnsetAllNetem() error {
	for _, executor := range c.NICExecutorMap {
		err := executor.unsetNetem()
		if err != nil {
			return err
		}
	}
	return nil
}

func (c *Controller) ExecuteNetem(form NetemForm) error {
	if executor, ok := c.NICExecutorMap[form.NIC]; ok {
		err := executor.executeNetem(form.DelayMs, form.LossRandomPercent, form.RateKbps)
		if err != nil {
			return err
		}
	} else {
		executor := &Executor{
			nic:         form.NIC,
			delayMs:     form.DelayMs,
			lossPercent: form.LossRandomPercent,
			rateKbps:    form.RateKbps,
			first:       true,
		}
		runtime.SetFinalizer(executor, func(executor *Executor) {
			executor.unsetNetem()
		})
		c.NICExecutorMap[form.NIC] = executor
		log.Println("create new executor", form.NIC)
		err := executor.executeNetem(form.DelayMs, form.LossRandomPercent, form.RateKbps)
		if err != nil {
			return err
		}
	}
	return nil
}

func (e *Executor) executeNetem(DelayMs float64, LossPercent float64, RateKbps float64) error {
	if DelayMs < 0 || LossPercent < 0 || RateKbps < 0 {
		err := e.unsetNetem()
		if err != nil {
			return err
		}
		return nil
	}
	operation := "change"
	if e.first {
		operation = "add"
		e.first = false
	}
	cmd := exec.Command(
		"tc",
		"qdisc",
		operation,
		"dev",
		e.nic,
		"root",
		"netem",
		"delay",
		fmt.Sprintf("%fms", DelayMs),
		"loss",
		fmt.Sprintf("%f%%", LossPercent),
		"rate",
		fmt.Sprintf("%fkbit", RateKbps),
	)
	log.Println("setNetem>", strings.Join(cmd.Args, " "))
	err := cmd.Run()
	if err != nil {
		log.Println(err)
		return err
	}
	out, err := cmd.Output()
	if err != nil {
		log.Println(err)
		return err
	}
	outStr := string(out)
	if outStr != "" {
		log.Println(outStr)
	}
	return nil
}

func (e *Executor) unsetNetem() error {
	cmd := exec.Command("tc", "qdisc", "del", "dev", e.nic, "root")
	log.Println("unsetNetem>", strings.Join(cmd.Args, " "))
	err := cmd.Run()
	if err != nil {
		log.Println(err)
		return err
	}
	out, err := cmd.Output()
	if err != nil {
		log.Println(err)
		return err
	}
	outStr := string(out)
	if outStr != "" {
		log.Println(outStr)
	}
	return nil
}
