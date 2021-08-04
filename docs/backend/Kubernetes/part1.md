---
title: Kubernetes-环境搭建
categories:
- backend
tags:
- k8s 
author: causes
---

## K8s 介绍

**前置知识**

- `Linux`
- `Docker`

**K8s 介绍**

`Kunernetes`，简称 K8s，因为 K 和 s 之间有 8 个字符，所以简称 8。这是一个开源的，用于管理云平台中多个主机上的容器化的应用。

K8s 是 Google 开发的，在经过生产环境十几年的考验之后，不断完善，最终在 2014 年开源出来。

传统的应用部署方式方式通过插件或者脚本来安装应用，这样做的缺点是应用的运行、配置、管理、所有生存周期将与当前操作系统绑定，这样做并不利于应用的升级更新/回滚等操作，虽然可以通过虚拟机的方式来实现某些功能，但是虚拟机非常重，并不利于可移植性。

新的方式是通过部署容器方式实现，简单来讲就是带环境安装，让生产环境和测试环境保持一致，避免很多不必要的麻烦。

容器化部署，Docker 虽然也可以做，但是上限也就在大几百，一旦数量增多，Docker 也就有心无力了。K8s 支持自动化部署、大规模的升级/回滚操作，让部署的过程更加简洁方便。

**K8s 功能**

- 自动装箱：自动完成，无需手动。
- 自我修复：当主节点挂掉之后，副节点会自动启动，启动并且自检之后对外提供服务。
- 水平扩展：高峰期可以自动扩展副本，高峰期过后会自动缩减副本。
- 服务发现：负载均衡。
- 滚动更新：应用加某几个服务之后，首先进行自检，检查之后没有问题对外提供服务。
- 版本回退：新的版本有 BUG，可以回退到上个版本。
- 密钥和配置管理：热部署，不需要重新构建镜像就可以更新配置。
- 存储编排：存储系统可以来自本地或者外部、云存储等。
- 批处理：支持一次任务、定时任务。

**K8s 集群架构组件**

- Master Node：主控节点（管理节点）。
    - API Server：集群的统一入口，各个组件的协调者，以 RESTFul 的风格，交给 ETCD 进行存储。
    - Scheduler：节点调度，选择工作节点应用部署。
    - Controller Manager：做集中控制管理，处理集群中的常规后台任务，一个资源对应一个 Controller。
    - ETCD：存储系统，用于保存集群中的相关数据。
- Worker Node：工作节点（做事情的节点）。
    - Kubelet：Master Node 派到 Worker Node 的一个代表，管理当前节点的容器部分。
    - Kube-proxy：提供网络代理，利用它也可以实现负载均衡等操作。
    - Docker：节点上容器的各种操作。

以后如果单单提到 Master 指的就是 Master Node，如果单单提到 Node 指的就是 Worker Node。

**K8s 核心概念**

- Pod：
    - 最小部署单元：Docker 可以部署容器，但是 K8s 的最小部署单元不是容器，而是一组容器的集合，也就是 Pod。
    - 一组容器的集合。
    - 一个 Pod 中是共享一组网络的。
    - 一个 Pod 的声明周期是短暂的。
- Controller：简单来讲就是用 Controller 创建出 Pod。
    - 确保预期的 Pod 的副本数量。
    - 无状态的应用部署：一个节点挂掉了，想要切换到另一个节点，随便使用。
    - 有状态的应用部署：一个节点挂掉了，想要切换到另一个节点，需要满足条件才可以使用，比如依赖存储单元，网络 IP 等。
    - 确保所有的 Worker Node 运行同一个 Pod。
    - 一次性任务和定时任务。
- Service：定义一组 Pod 的访问规则。

## 搭建 K8s 集群

### 先行介绍

**平台规划**

之前的内容中提到过，K8s 的两个节点：Master 和 Node，Node 肯定是多个的，那么就要看 Master。

所以我们有两个规划：*单 Master 集群*和*多 Master 集群*。

![2021-08-04-20-12-25](./images/2021-08-04-20-12-25.png)

![2021-08-04-20-14-05](./images/2021-08-04-20-14-05.png)

为了测试简单，我们使用一主两从的集群来作为测试环境的搭建。

**安装方式**

kubernetes 有多种部署方式，目前的主流方式有 minikube、kubeadm、二进制包：

- minikube：搭建单节点的 kubernetes 工具，这个我们不做考虑（我们要搭建的是集群）。
- kubeadm：快速搭建 kubernetes 的工具。
- 二进制包：从官网上下载每一个组件的二进制包，依次安装，这个对于理解 kubernetes 的组件更加有效。

我们现在使用的是 kubeadm 的方式来进行安装。

**主机规划**

| 作用   | IP 地址         | 配置                       |
| ------ | --------------- | -------------------------- |
| Master | 192.168.109.100 | 2 CPU，2 G 内存，50 G 硬盘 |
| Node1  | 192.168.109.101 | 2 CPU，2 G 内存，50 G 硬盘 |
| Node2  | 192.168.109.102 | 2 CPU，2 G 内存，50 G 硬盘 |

:::tip
主机规划时注意，选择软件安装时，选择基础设施服务器。
:::

**主机环境初始化**

1. 检查操作系统版本，CentOS 必须要在 7.5 上。

    ```shell
    cat /etc/redhat-release
    ```

1. 设置主机名的解析，编辑 `/etc/hosts` 文件，这是测试服务器，企业环境中一般使用 DNS 服务器做解析：

    ```shell
    192.168.109.100 master
    192.168.109.101 node1
    192.168.109.102 node2
    ```

1. 时间同步，Kubernetes 要求集群中的节点时间必须精确一致，这里直接使用 chronyd 服务从网络同步时间：

    ```shell
    systemctl start chronyd
    systemctl enable chronyd
    # 等待几秒，使用 date 来验证时间
    date
    ```

1. Kubernetes 和 Docker 在启动的时候会产生大量的 iptables 规则，为了不让系统规则和他们混淆，我们关闭系统规则，生产环境防火墙关闭一定要慎重：

    ```shell
    systemctl stop firewalld
    systemctl disable firewalld
    systemctl stop iptables
    systemctl disable iptables
    ```

1. 禁用 selinux，selinux 是一个 Linux 下的安全服务，假如不关闭，可能会产生一些奇葩问题，编辑 `/etc/selinux/config`：

    ```shell
    SELINUX=disabled
    ```

1. 禁用 swap 分区：
    
    swap 分区在 Linux 指的是虚拟内存分区，在物理内存满了之后，用磁盘空间当内存用。

    但是 swap 分区会对系统设备产生极其负面的影响，所以 Kubernetes 要求每一个节点都要禁用 swap 设备，假如实在关不掉，在启动集群的时候就要明确指定参数配置。

    编辑 `/etc/fstab`，编辑完成之后重启 Linux：

    ```shell
    # /dev/mapper/centos-swap swap                    swap    defaults        0 0
    ```

1. 修改 Linux 内核参数：

    为 Linux 添加网桥过滤和地址转发功能，修改 `/etc/sysctl.d/kubernetes.conf`：

    ```shell
    net.bridge.bridge-nf-call-ip6tables = 1
    net.bridge.bridge-nf-call-iptables = 1
    net.ipv4.ip_forward = 1
    ```

    重新加载配置：`sysctl -p`

    ```shell
    # 网桥过滤
    modprobe br_netfilter
    # 查看是否加载成功
    lsmod | grep br_netfilter
    ```

1. 配置 ipvs 功能

    kubernetes 中和 service 中有两种代理模式：iptables 和 ipvs，ipvs 的性能高，需要手动载入。

    ```shell
    yum -y install ipset ipvsadmin
    ```

    ```shell
    cat <<EOF > /etc/sysconfig/modules/ipvs.modules
    #!/bin/bash
    modprobe -- ip_vs
    modprobe -- ip_vs_rr
    modprobe -- ip_vs_wrr
    modprobe -- ip_vs_sh
    modprobe -- nf_conntrack_ipv4
    EOF
    ```

    ```shell
    # 增加可执行权限，之后执行
    chmod +x /etc/sysconfig/modules/ipvs.modules
    # 查看是否加载成功
    lsmod | grep -e ip_vs -e nf_conntrack_ipv4
    ```

1. 重启 Linux

