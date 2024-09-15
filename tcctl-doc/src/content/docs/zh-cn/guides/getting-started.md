---
title: 快速开始
description: 在五分钟内配置好 tcctl。
---

## 第 0 步

你需要一个硬件来与 tcctl 配合使用，请查看[硬件设置指南](/zh-cn/guides/hardware-setup)。

## 安装与运行

:::caution
以下操作应以root用户身份进行。
:::

1. 在 OpenWrt 上下载[发布的压缩包](https://github.com/3DRX/tcctl/releases/latest)，并解压到 `/root/tcctl`
2. 安装 [tc](https://man7.org/linux/man-pages/man8/tc.8.html)，例如在 OpenWrt 上使用 opkg：
```sh
opkg update && opkg install tc-full
```
3. 重启
4. `cd /root/tcctl && chmod +x ./install.sh && ./install.sh`
5. 完成！前往 `http://<host_name>:8080`

## 故障排除

服务器日志可以在 tcctl.log 中找到，如发现任何问题，请在 [Github issue 上提交问题](https://github.com/3DRX/tcctl/issues/new)。
