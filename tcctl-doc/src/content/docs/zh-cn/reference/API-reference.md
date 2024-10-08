---
title: 服务端 API 文档
description: Tcctl 服务端 API 文档
---

:::caution
本页面尚未经过翻译。
:::

## POST `/api/v2/interfaces`

### request

none

### response

#### 200

```json
{
  "NIC": [
    <bytes sent>,
    <bytes received>
  ]
}
```

example

```json
{
  "docker0": [
    0,
    0
  ],
  "enp0s31f6": [
    0,
    0
  ],
  "lo": [
    21573968,
    21573968
  ],
  "wlp0s20f3": [
    58817628,
    2485692258
  ]
}
```

## PUT `/api/v2/netem`

### request

| name                         | type   | description                                                         |
|------------------------------|--------|---------------------------------------------------------------------|
| nic                          | string | network interface name                                              |
| delayMs                      | float  | delay time in ms                                                    |
| delayJitterMs                | float  | delay jitter in ms                                                  |
| delayCorrelationPercent      | float  | delay correlation percentage                                        |
| delayDistribution            | string | delay distribution: uniform \| normal \| pareto \| paretonormal     |
| lossRandomPercent            | float  | loss percentage in random mode                                      |
| lossRandomCorrelationPercent | float  | loss correlation percentage in random mode                          |
| lossStateP13                 | float  | p13 value of state mode loss                                        |
| lossStateP31                 | float  | p31 value of state mode loss                                        |
| lossStateP32                 | float  | p32 value of state mode loss                                        |
| lossStateP23                 | float  | p23 value of state mode loss                                        |
| lossStateP14                 | float  | p14 value of state mode loss                                        |
| lossGEModelPercent           | float  | loss percentage in GE model mode                                    |
| lossGEModelR                 | float  | r value of GE model mode                                            |
| lossGEModel1H                | float  | h value of GE model mode                                            |
| lossGEModel1K                | float  | k value of GE model mode                                            |
| lossECN                      | bool   | ecn enabled                                                         |
| corruptPercent               | float  | packet corruption percentage                                        |
| corruptCorrelationPercent    | float  | packet corruption correlation percentage                            |
| duplicatePercent             | float  | packet duplication percentage                                       |
| duplicateCorrelationPercent  | float  | packet duplication correlation percentage                           |
| reorderPercent               | float  | packet reorder percentage                                           |
| reorderCorrelationPercent    | float  | packet reorder correlation percentage                               |
| reorderGapDistance           | float  | packet reorder gap distance                                         |
| rateKbps                     | float  | rate limit in Kbps                                                  |
| slotMinDelayMs               | float  | minimum delay time in ms of slot mode                               |
| slotMaxDelayMs               | float  | maximum delay time in ms of slot mode                               |
| slotDistribution             | string | slot distribution type: uniform \| normal \| pareto \| paretonormal |
| slotDelayJitterMs            | float  | slot delay jitter time in ms                                        |
| slotPackets                  | int    | slot packets count                                                  |
| slotBytes                    | int    | slot bytes                                                          |
| queueType                    | string | queue type: pfifo \| bfifo                                          |
| queueLimitBytes              | int    | queue size limit in bytes                                           |
| queueLimitPackets            | int    | queue size limit in packets                                         |

### response

#### 200

```json
"ok"
```

#### 400

```json
"error"
```

#### 500

```json
"error"
```

## POST `/api/v2/bufferstate`

### request

| name | type   | description            |
|------|--------|------------------------|
| nic  | string | network interface name |

### response

| name           | type   | description                                     |
|----------------|--------|-------------------------------------------------|
| qdiscName      | string | qdisc the buffer belongs to                     |
| parent         | string | parent qdisc id                                 |
| rule           | string |                                                 |
| sentBytes      | int    | bytes sent through this buffer                  |
| sentPackets    | int    | packets sent through this buffer                |
| droppedPackets | int    | packets dropped by this buffer                  |
| overlimits     | int    | packets dropped due to overlimit by this buffer |
| requeues       | int    | packets re-entered the queue                    |
| backlogBytes   | int    | bytes in buffer                                 |
| backlogPackets | int    | bytes in buffer                                 |

example

```json
[
  {
    "qdiscName": "netem 1",
    "parent": "",
    "rule": "root refcnt 2 limit 1000 rate 2048Kbit",
    "sentBytes": 1310818,
    "sentPackets": 183,
    "droppedPackets": 0,
    "overlimits": 0,
    "requeues": 0,
    "backlogBytes": 757724,
    "backlogPackets": 40
  },
  {
    "qdiscName": "bfifo 2",
    "parent": "1",
    "rule": "limit 1000Kb",
    "sentBytes": 1310818,
    "sentPackets": 183,
    "droppedPackets": 0,
    "overlimits": 0,
    "requeues": 0,
    "backlogBytes": 0,
    "backlogPackets": 0
  }
]
```
