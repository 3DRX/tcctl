package netem

import (
	"bytes"
	"fmt"
	"os/exec"
	"runtime"
	"strings"

	"github.com/3DRX/tcctl/server/logger"
)

// TODO: Implement the additional netem props
type NetemForm struct {
	// detailed props description:
	// https://man7.org/linux/man-pages/man8/tc-netem.8.html
	NIC                          string  `json:"nic"`
	DelayMs                      float64 `json:"delayMs"`
	DelayJitterMs                float64 `json:"delayJitterMs"`
	DelayCorrelationPercent      float64 `json:"delayCorrelationPercent"`
	DelayDistribution            string  `json:"delayDistribution"`
	LossRandomPercent            float64 `json:"lossRandomPercent"`
	LossRandomCorrelationPercent float64 `json:"lossRandomCorrelationPercent"`
	LossStateP13                 float64 `json:"lossStateP13"`
	LossStateP31                 float64 `json:"lossStateP31"`
	LossStateP32                 float64 `json:"lossStateP32"`
	LossStateP23                 float64 `json:"lossStateP23"`
	LossStateP14                 float64 `json:"lossStateP14"`
	LossGEModelPercent           float64 `json:"lossGEModelPercent"`
	LossGEModelR                 float64 `json:"lossGEModelR"`
	LossGEModel1H                float64 `json:"lossGEModel1H"`
	LossGEModel1K                float64 `json:"lossGEModel1K"`
	LossECN                      bool    `json:"lossECN"`
	CorruptPercent               float64 `json:"corruptPercent"`
	CorruptCorrelationPercent    float64 `json:"corruptCorrelationPercent"`
	DuplicatePercent             float64 `json:"duplicatePercent"`
	DuplicateCorrelationPercent  float64 `json:"duplicateCorrelationPercent"`
	ReorderPercent               float64 `json:"reorderPercent"`
	ReorderCorrelationPercent    float64 `json:"reorderCorrelationPercent"`
	ReorderGapDistance           float64 `json:"reorderGapDistance"`
	RateKbps                     float64 `json:"rateKbps"`
	SlotMinDelayMs               float64 `json:"slotMinDelayMs"`
	SlotMaxDelayMs               float64 `json:"slotMaxDelayMs"`
	SlotDistribution             string  `json:"slotDistribution"`
	SlotDelayJitterMs            float64 `json:"slotDelayJitterMs"`
	SlotPackets                  int64   `json:"slotPackets"`
	SlotBytes                    int64   `json:"slotBytes"`
}

func (n *NetemForm) lossRandomSet() bool {
	return n.LossRandomPercent != 0 ||
		n.LossRandomCorrelationPercent != 0
}

func (n *NetemForm) lossStateSet() bool {
	return n.LossStateP13 != 0 ||
		n.LossStateP31 != 0 ||
		n.LossStateP32 != 0 ||
		n.LossStateP23 != 0 ||
		n.LossStateP14 != 0
}

func (n *NetemForm) lossGEModelSet() bool {
	return n.LossGEModelPercent != 0 ||
		n.LossGEModelR != 0 ||
		n.LossGEModel1H != 0 ||
		n.LossGEModel1K != 0
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
	if n.DelayDistribution != "uniform" &&
		n.DelayDistribution != "normal" &&
		n.DelayDistribution != "pareto" &&
		n.DelayDistribution != "paretonormal" &&
		n.DelayDistribution != "" {
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
	if n.SlotDistribution != "uniform" &&
		n.SlotDistribution != "normal" &&
		n.SlotDistribution != "pareto" &&
		n.SlotDistribution != "paretonormal" &&
		n.SlotDistribution != "" {
		return fmt.Errorf("SlotDistribution must be one of uniform, normal, pareto, paretonormal")
	}
	if n.slotMinMaxDelaySet() && !n.slotDistributionSet() {
		return fmt.Errorf("SlotDistribution must be set if SlotMinDelayMs or SlotMaxDelayMs is set")
	}
	return nil
}

type Executor struct {
	nic      string
	lastForm *NetemForm
	first    bool
}

type Controller struct {
	NICExecutorMap map[string]*Executor
}

var controller *Controller

func init() {
	controller = &Controller{}
	logger.GetInstance().Info("init controller")
	controller.NICExecutorMap = make(map[string]*Executor)
}

func GetController() *Controller {
	return controller
}

func (c *Controller) UnsetAllNetem() []string {
	ret := make([]string, 0)
	for _, executor := range c.NICExecutorMap {
		err := executor.unsetNetem()
		if err != nil {
			ret = append(ret, err.Error())
		}
	}
	return ret
}

func (c *Controller) ExecuteNetem(form *NetemForm) error {
	err := form.validate()
	if err != nil {
		return err
	}
	if executor, ok := c.NICExecutorMap[form.NIC]; ok {
		err := executor.executeNetem(form)
		if err != nil {
			return err
		}
		executor.lastForm = form
	} else {
		executor := &Executor{
			nic:   form.NIC,
			first: true,
		}
		runtime.SetFinalizer(executor, func(executor *Executor) {
			executor.unsetNetem()
		})
		c.NICExecutorMap[form.NIC] = executor
		logger := logger.GetInstance()
		logger.Info("create new executor " + form.NIC)
		initErr := executor.unsetNetem()
		if initErr != nil {
			logger.Warn("clear netem error: " + initErr.Error())
		}
		err := executor.executeNetem(form)
		if err != nil {
			return err
		}
		executor.lastForm = form
	}
	return nil
}

func (e *Executor) executeNetem(f *NetemForm) error {
	if f.DelayMs < 0 || f.LossRandomPercent < 0 || f.RateKbps < 0 {
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
	cmdArr := []string{
		"tc",
		"qdisc",
		operation,
		"dev",
		e.nic,
		"root",
		"netem",
		"delay",
		fmt.Sprintf("%fms", f.DelayMs),
		fmt.Sprintf("%fms", f.DelayJitterMs),
		fmt.Sprintf("%f%%", f.DelayCorrelationPercent),
	}
	if f.DelayDistribution != "" {
		cmdArr = append(cmdArr, "distribution", f.DelayDistribution)
	}
	cmdArr = append(cmdArr, "loss")
	if f.lossRandomSet() {
		cmdArr = append(
			cmdArr,
			"random",
			fmt.Sprintf("%f%%", f.LossRandomPercent),
			fmt.Sprintf("%f%%", f.LossRandomCorrelationPercent),
		)
	} else if f.lossStateSet() {
		cmdArr = append(
			cmdArr,
			"state",
			fmt.Sprintf("%f%%", f.LossStateP13),
			fmt.Sprintf("%f%%", f.LossStateP31),
			fmt.Sprintf("%f%%", f.LossStateP32),
			fmt.Sprintf("%f%%", f.LossStateP23),
			fmt.Sprintf("%f%%", f.LossStateP14),
		)
	} else if f.lossGEModelSet() {
		cmdArr = append(
			cmdArr,
			"gemodel",
			fmt.Sprintf("%f%%", f.LossGEModelPercent),
			fmt.Sprintf("%f", f.LossGEModelR),
			fmt.Sprintf("%f", f.LossGEModel1H),
			fmt.Sprintf("%f", f.LossGEModel1K),
		)
	} else {
		cmdArr = append(cmdArr, "0%")
	}
	if f.LossECN {
		cmdArr = append(cmdArr, "ecn")
	}
	cmdArr = append(
		cmdArr,
		"corrupt",
		fmt.Sprintf("%f%%", f.CorruptPercent),
		fmt.Sprintf("%f%%", f.CorruptCorrelationPercent),
	)
	cmdArr = append(
		cmdArr,
		"duplicate",
		fmt.Sprintf("%f%%", f.DuplicatePercent),
		fmt.Sprintf("%f%%", f.DuplicateCorrelationPercent),
	)
	cmdArr = append(
		cmdArr,
		"reorder",
		fmt.Sprintf("%f%%", f.ReorderPercent),
		fmt.Sprintf("%f%%", f.ReorderCorrelationPercent),
		"gap",
		fmt.Sprintf("%d", int64(f.ReorderGapDistance)),
	)
	cmdArr = append(cmdArr, "rate", fmt.Sprintf("%fkbit", f.RateKbps))
	if f.slotDistributionSet() || f.slotMinMaxDelaySet() {
		cmdArr = append(cmdArr, "slot")
		if f.slotMinMaxDelaySet() {
			cmdArr = append(
				cmdArr,
				fmt.Sprintf("%fms", f.SlotMinDelayMs),
				fmt.Sprintf("%fms", f.SlotMaxDelayMs),
			)
		} else if f.slotDistributionSet() {
			cmdArr = append(
				cmdArr,
				"distribution",
				f.SlotDistribution,
				fmt.Sprintf("%fms", f.SlotDelayJitterMs),
			)
		}
		cmdArr = append(
			cmdArr,
			"packets",
			fmt.Sprintf("%d", f.SlotPackets),
			"bytes",
			fmt.Sprintf("%d", f.SlotBytes),
		)
	}
	cmd := exec.Command(cmdArr[0], cmdArr[1:]...)
	logger.GetInstance().Info("setNetem>" + strings.Join(cmd.Args, " "))
	return executeCommand(cmd)
}

func (e *Executor) unsetNetem() error {
	if e.first { // no need to unset
		return nil
	}
	cmd := exec.Command("tc", "qdisc", "del", "dev", e.nic, "root")
	logger.GetInstance().Info("unsetNetem>" + strings.Join(cmd.Args, " "))
	err := executeCommand(cmd)
	if err == nil {
		e.first = true
	}
	return err
}

func executeCommand(cmd *exec.Cmd) error {
	buf := new(bytes.Buffer)
	cmd.Stdout = buf
	cmd.Stderr = buf
	cmd.Run()
	str := buf.String()
	if str != "" {
		fmt.Println(str)
		return fmt.Errorf(str)
	}
	return nil
}
