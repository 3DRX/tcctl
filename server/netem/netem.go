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
	NIC                         string  `json:"nic"`
	DelayMs                     float64 `json:"delayMs"`
	DelayJitterMs               float64 `json:"delayJitterMs"`
	DelayCorrelationPercent     float64 `json:"delayCorrelationPercent"`
	DelayDistribution           string  `json:"delayDistribution"`
	LossRandomPercent           float64 `json:"lossRandomPercent"`
	LossStateP13                float64 `json:"lossStateP13"`
	LossStateP31                float64 `json:"lossStateP31"`
	LossStateP32                float64 `json:"lossStateP32"`
	LossStateP23                float64 `json:"lossStateP23"`
	LossStateP14                float64 `json:"lossStateP14"`
	LossGEModelPercent          float64 `json:"lossGEModelPercent"`
	LossGEModelR                float64 `json:"lossGEModelR"`
	LossGEModel1H               float64 `json:"lossGEModel1H"`
	LossGEModel1K               float64 `json:"lossGEModel1K"`
	LossECN                     bool    `json:"lossECN"`
	CorruptPercent              float64 `json:"corruptPercent"`
	CorruptCorrelationPercent   float64 `json:"corruptCorrelationPercent"`
	DuplicatePercent            float64 `json:"duplicatePercent"`
	DuplicateCorrelationPercent float64 `json:"duplicateCorrelationPercent"`
	ReorderPercent              float64 `json:"reorderPercent"`
	ReorderCorrelationPercent   float64 `json:"reorderCorrelationPercent"`
	ReorderGapDistance          float64 `json:"reorderGapDistance"`
	RateKbps                    float64 `json:"rateKbps"`
	SlotMinDelayMs              float64 `json:"slotMinDelayMs"`
	SlotMaxDelayMs              float64 `json:"slotMaxDelayMs"`
	SlotDistribution            string  `json:"slotDistribution"`
	SlotDelayJitterMs           float64 `json:"slotDelayJitterMs"`
	SlotPackets                 int64   `json:"slotPackets"`
	SlotBytes                   int64   `json:"slotBytes"`
}

func (n *NetemForm) lossRandomSet() bool {
	return n.LossRandomPercent != 0
}

func (n *NetemForm) lossStateSet() bool {
	return n.LossStateP13 != 0 || n.LossStateP31 != 0 || n.LossStateP32 != 0 || n.LossStateP23 != 0 || n.LossStateP14 != 0
}

func (n *NetemForm) lossGEModelSet() bool {
	return n.LossGEModelPercent != 0 || n.LossGEModelR != 0 || n.LossGEModel1H != 0 || n.LossGEModel1K != 0
}

func (n *NetemForm) slotMinMaxDelaySet() bool {
	return n.SlotMinDelayMs != 0 || n.SlotMaxDelayMs != 0
}

func (n *NetemForm) slotDistributionSet() bool {
	return n.SlotDistribution != ""
}

func (n *NetemForm) validate() error {
	if n.NIC == "" {
		return fmt.Errorf("NIC is required")
	}
	if n.DelayDistribution != "uniform" && n.DelayDistribution != "normal" && n.DelayDistribution != "pareto" && n.DelayDistribution != "paretonormal" && n.DelayDistribution != "" {
		return fmt.Errorf("DelayDistribution must be one of uniform, normal, pareto, paretonormal")
	}
	// loss pattern can only be one of ["random", "state", "gemodel"]
	if n.lossRandomSet() {
		if n.lossStateSet() {
			return fmt.Errorf("random loss and state loss cannot be set at the same time")
		}
		if n.lossGEModelSet() {
			return fmt.Errorf("random loss and gemodel loss cannot be set at the same time")
		}
	} else if n.lossStateSet() {
		if n.lossRandomSet() {
			return fmt.Errorf("random loss and state loss cannot be set at the same time")
		}
		if n.lossGEModelSet() {
			return fmt.Errorf("state loss and gemodel loss cannot be set at the same time")
		}
	} else if n.lossGEModelSet() {
		if n.lossRandomSet() {
			return fmt.Errorf("random loss and gemodel loss cannot be set at the same time")
		}
		if n.lossStateSet() {
			return fmt.Errorf("state loss and gemodel loss cannot be set at the same time")
		}
	}
	if n.SlotDistribution != "uniform" && n.SlotDistribution != "normal" && n.SlotDistribution != "pareto" && n.SlotDistribution != "paretonormal" && n.SlotDistribution != "" {
		return fmt.Errorf("SlotDistribution must be one of uniform, normal, pareto, paretonormal")
	}
	if n.slotMinMaxDelaySet() && !n.slotDistributionSet() {
		return fmt.Errorf("SlotDistribution must be set if SlotMinDelayMs or SlotMaxDelayMs is set")
	}
	return nil
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
	// debug
	fmt.Printf("form: %+v\n", form)
	err := form.validate()
	if err != nil {
		return err
	}
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
