package netem

import (
	"fmt"
	"os/exec"
	"strconv"
	"strings"

	"github.com/3DRX/tcctl/server/logger"
)

type BufferStateForm struct {
	NIC string `json:"nic"`
}

type BufferState struct {
	SentBytes      int64 `json:"sentBytes"`
	SentPackets    int64 `json:"sentPackets"`
	DroppedPackets int64 `json:"droppedPackets"`
	Overlimits     int64 `json:"overlimits"`
	Requeues       int64 `json:"requeues"`
	BacklogBytes   int64 `json:"backlogBytes"`
	BacklogPackets int64 `json:"backlogPackets"`
}

func GetBufferState(form *BufferStateForm) (*BufferState, error) {
	// call command:
	cmdArr := []string{
		"tc",
		"-s",
		"-d",
		"qdisc",
		"show",
		"dev",
		form.NIC,
	}
	cmd := exec.Command(cmdArr[0], cmdArr[1:]...)
	logger.GetInstance().Info("getBufferState>" + strings.Join(cmd.Args, " "))
	outStr, err := bufferStateExecuteCommand(cmd)
	if err != nil {
		return nil, err
	}
	// out Str in format:
	//  Sent 0 bytes 0 pkt (dropped 0, overlimits 0 requeues 0)
	//  backlog 0b 0p requeues 0
	result := &BufferState{}
	// parse outStr
	lines := strings.Split(outStr, "\n")
	firstFields := strings.Fields(lines[1])
	logger.GetInstance().Info(fmt.Sprintf("firstFields: %v", firstFields))
	result.SentBytes, err = strconv.ParseInt(firstFields[1], 10, 64)
	if err != nil {
		return nil, err
	}
	result.SentPackets, err = strconv.ParseInt(firstFields[3], 10, 64)
	if err != nil {
		return nil, err
	}
	droppedPacketsStr := firstFields[6]
	// trim the last character ','
	droppedPacketsStr = droppedPacketsStr[:len(droppedPacketsStr)-1]
	result.DroppedPackets, err = strconv.ParseInt(droppedPacketsStr, 10, 64)
	if err != nil {
		return nil, err
	}
	result.Overlimits, err = strconv.ParseInt(firstFields[8], 10, 64)
	if err != nil {
		return nil, err
	}
	requeuesStr := firstFields[10]
	// trim the last character ')'
	requeuesStr = requeuesStr[:len(requeuesStr)-1]
	result.Requeues, err = strconv.ParseInt(requeuesStr, 10, 64)
	if err != nil {
		return nil, err
	}
	secondFields := strings.Fields(lines[2])
	logger.GetInstance().Info(fmt.Sprintf("secondFields: %v", secondFields))
	backlogBytesStr := secondFields[1]
	// trim the last character 'b'
	backlogBytesStr = backlogBytesStr[:len(backlogBytesStr)-1]
	result.BacklogBytes, err = strconv.ParseInt(backlogBytesStr, 10, 64)
	if err != nil {
		return nil, err
	}
	backlogPacketsStr := secondFields[2]
	// trim the last character 'p'
	backlogPacketsStr = backlogPacketsStr[:len(backlogPacketsStr)-1]
	result.BacklogPackets, err = strconv.ParseInt(backlogPacketsStr, 10, 64)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func bufferStateExecuteCommand(cmd *exec.Cmd) (string, error) {
	// err := cmd.Run()
	// if err != nil {
	// 	return nil, err
	// }
	// return nil, nil
	// run cmd and return output
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(output), nil
}
