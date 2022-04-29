---
title: Proxy-01-如何进行科学上网
category:
- base
tag:
- proxy
author: causes
---

Linux 和 Windows、Mac 是不一样的，虽然支持科学上网的软件有一些，但是大部分都不支持订阅链接的形式，而是要求有一台自己的服务器。

[electron-ssr](https://github.com/qingshuisiyuan/electron-ssr-backup/releases)，这个工具是 ShadowsocksR 桌面应用，最重要的是支持订阅链接的方式，并且开源。

Linux 下的安装下载 AppImage 即可，AppImage 是各种发行版通用的。下载下来之后给一个执行的权限 `chmod +x electron` 然后即可执行，将订阅链接放进去之后即可。

工具有了，但是在 Linux 系统下配置还没有完成

系统代理设置：在 设置 --> 网络中即可设置代理，端口号 electron 的默认设置为 http://127.0.0.1:12333，如果想要改变那就去设置中手动更改。


浏览器想要科学上网有几种方式：

1. 修改 Google Chrome 或者其他浏览器的配置文件，手动设置 `http_proxy` 的代理。
2. 在 Google Chrome 的设置中设置代理模式。
3. 使用插件 SwitchyOmega 手动设置代理，在 proxy 选项中设置 HTTP 的端口号 12333 和主机 127.0.0.1。

除此之外，假如想要设置 Git 之类的工具代理，那:wq么只能手动进行设置，比如 `export http_proxy xxx`。
