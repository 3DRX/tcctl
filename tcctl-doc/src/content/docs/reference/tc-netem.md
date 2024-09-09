---
title: What is tc and netem?
description: How traffic control works in Linux.
---

Linux provides powerful tools for network traffic control and shaping.
Two of the most versatile are tc (traffic control) and netem (Network Emulator).

## What is tc?

tc is a user-space utility program used to configure Traffic Control in the Linux kernel.
It's part of the iproute2 package and allows users to shape, schedule, police, and prioritize network traffic.

Key features of tc:
1. Shaping: Delay packets to control output rate
2. Scheduling: Reorder packets for transmission
3. Policing: Measure and limit the input rate of traffic
4. Dropping: Discard some or all packets in a traffic stream
5. Marking: Change the TOS field of packets

## What is netem?

netem (Network Emulator) is a feature of tc that allows adding various network impairments to outgoing packets.
It's particularly useful for testing the behavior of applications and protocols under different network conditions.

Key features of netem:

1. Delay: Add latency to packets
2. Loss: Randomly drop packets
3. Duplication: Create duplicate packets
4. Corruption: Introduce errors in packet data
5. Re-ordering: Change the order of packets

## Conclution

tc and netem allow precise control over network conditions, enabling thorough testing of applications under various scenarios.
Whether you're developing a new network protocol, optimizing an existing application, or troubleshooting network issues,
these tools provide invaluable capabilities for manipulating and analyzing network traffic in Linux environments.
