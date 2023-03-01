---
title: Kubernetes-05-数据存储、安全认证、Dashboard
categories:
- backend
tags:
- k8s
author: causes
---

## 数据存储

容器会频繁创建销毁，容器在销毁同时，数据也会被清除。那么为了保存数据，k8s 提出了 volume，也就是共享目录。

volume 在 pod 上定义，被一个 pod 中的多个容器挂载到具体文件目录下，k8s 通过 volume 实现同 pod 的不同容器数据共享以及持久化存储。

volume 的生命周期和 pod 中的容器相关，容器终止、重启时，volume 数据不会丢失。

volume 有多种类型：

- 简单存储：EmptyDir、HostPath、NFS
- 高级存储：PV、PVC
- 配置存储：ConfigMap、Secret

### 简单存储

**EmptyDir**

最简单的 Volume 类型，就是主机上的一个空目录。pod 在分配到 node 的同时就会创建一次，k8s 会自动分配宿主机上的目录。pod 销毁时，EmptyDir 中的数据也会被销毁。

一般作用于临时目录、多容器共享目录。

![](images/2022-08-22-10-19-30.png)

```yml
apiVersion: v1
kind: Pod
metadata:
  name: volume-emptydir
  namespace: dev
spec:
  containers:
    - name: nginx
      image: nginx:1.14-alpine
      ports:
        - containerPort: 80
      volumeMounts:
        # 挂载目录为 /var/log/nginx
        - mountPath: /var/log/nginx
          name: logs-volume
    - name: busybox
      image: busybox:1.30
      command: ['/bin/bash', '-c', 'tail -f /logs/access.log']
      # 挂载目录为 /logs
      volumeMounts:
        - mountPath: /logs
          name: logs-volume
  volumes:
    - name: logs-volume
      emptyDir: {}
```

pod 中有两个容器，容器之间通过 volume 进行文件共享。其中 nginx 容器将自身的 `/var/log/nginx` 目录挂载到了 volume 下，busybox 容器将 `/log` 目录挂载到了 volume 下。

nginx 写 log 文件，通过 volume，busybox 可以读取 nginx 中的 log 文件并且将其输出。

**HostPath**

EmptyDir 中的数据不会被持久化，pod 结束就会销毁。如果想要持久化，最简单的方式是 HostPath。

hostPath 是将 pod 中的 volume 实际挂载到 node 上，这样就可以保证数据持久化。

![](images/2022-08-22-10-24-49.png)

```yml
apiVersion: v1
kind: Pod
metadata:
  name: volume-emptydir
  namespace: dev
spec:
  containers:
    - name: nginx
      image: nginx:1.14-alpine
      ports:
        - containerPort: 80
      volumeMounts:
        # 挂载目录为 /var/log/nginx
        - mountPath: /var/log/nginx
          name: logs-volume
    - name: busybox
      image: busybox:1.30
      command: ['/bin/bash', '-c', 'tail -f /logs/access.log']
      # 挂载目录为 /logs
      volumeMounts:
        - mountPath: /logs
          name: logs-volume
  volumes:
    - name: logs-volume
      # 唯一的区别是从 EmptyDir 改为了 HostPath
      hostPath:
        path: /tmp/logs
        # 此目录存在则使用，不存在则创建后使用
        type: DirectoryOrCreate
```

type 类型：

- DirectoryOrCreate：此目录存在则使用，不存在则创建后使用
- Directory：目录必须存在
- FileOrCreate：文件存在则使用，不存在则创建后使用
- File：文件必须存在

**NFS**

如果说 HostPath 是 EmptyDir 的升级版，那么 NFS 是 HostPath 的升级版。它解决了 Node 节点故障导致的 Path 问题。

使用 NFS 方式，需要 NFS 服务器，Pod 中的存储会直接上传到 NFS 中，这样即使 Pod 故障，NFS 没问题，数据就可以访问。

1. 首先需要安装 nfs：

    1. 随便找一台节点做 nfs 服务器，这里选用的是 node1：`yum -y install nfs-utils`
    1. 准备共享目录：`sudo mkdir /data/nfs -pv`
    1. 共享目录以读写权限暴露给 `192.168.10.*`：`vim /etc/exports`

        `/etc/exports` 文件是 nfs 读取的一个默认文件

        ```text
        /data/nfs 192.168.10.0/24(rw,no_root_squash)
        ```

    1. 在其他节点上都要安装 nfs，目的不是为了变为服务器，而是为了使用 nfs 设备
    1. 在其他节点上关闭 nfs 服务，我们其他节点上只需要一个驱动包即可。

1. 使用 nfs

    ```yml
    apiVersion: v1
    kind: Pod
    metadata:
      name: nfs
      namespace: dev
    spec:
      containers:
        - name: nginx
          image: nginx:1.14-alpine
          ports:
            - containerPort: 80
          volumeMounts:
            # 挂载目录为 /var/log/nginx
            - mountPath: /var/log/nginx
              name: logs-volume
        - name: busybox
          image: busybox:1.30
          command: ['/bin/sh', '-c', 'tail -f /logs/access.log']
          # 挂载目录为 /logs
          volumeMounts:
            - mountPath: /logs
              name: logs-volume
      volumes:
        - name: logs-volume
          # 使用 nfs
          nfs:
            path: /data/nfs
            server: 192.168.10.101
    ```

### 高阶存储

高阶存储是 pv、pvc。

简单来说，pv 是由管理员维护的，将所有存储配置抽象为相同的资源对用户提供。用户只需要知道 pv 的规则即可，不在乎究竟是哪个文件系统。

pvc 是用户维护的，是对 pv 的申请。

**pv**

pv 就是对各种存储设备的抽象，每个存储都不同，则有一定的差异性。

```yml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv1
spec:
  # 存储类型，和底层对应，不同的存储方式对应的配置不同，要看对应的官方文档
  nfs:
    path: /data/nfs/pv/pv1/
    server: 192.168.10.101
  # 存储能力，对外提供的资源共多少，当前仅支持存储空间的设置
  capacity:
    storage: 2G
  # 访问模式，ReadOnlyMany（只读）、ReadWriteMany（可读写）、ReadWriteOnce（可读写，但只能被一个 pvc 独占）
  # 具体存储系统支持的访问模式不同，nfs 三种全都支持
  accessModes: [ReadWriteMany]
  # 回收策略，pv 不再被使用后，数据的处理方式。Retain（保留）、Delete（删除）、Recycle（已经废弃，效果等于 rm -rf /data/*）
  persistentVolumeReclaimPolicy: Delete

---

apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv2
spec:
  nfs:
    path: /data/nfs/pv/pv2/
    server: 192.168.10.101
  capacity:
    storage: 1G
  accessModes: [ReadWriteMany]
  persistentVolumeReclaimPolicy: Delete

---

apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv3
spec:
  nfs:
    path: /data/nfs/pv/pv3/
    server: 192.168.10.101
  capacity:
    storage: 2G
  accessModes: [ReadWriteMany]
  persistentVolumeReclaimPolicy: Delete
```

一个 pv 的生命周期：

- available: 可用
- bound: 已被 pvc 绑定
- released: pvc 已被删除，但是资源还未被集群重新声明
- failed: 回收失败

:::tips
注意一点，pv 没有名称空间的概念，我们在编写配置文件和查看的时候都不需要带名称空间
:::

**pvc**

```yml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc
  namespace: dev
spec:
  # 可以根据访问模式来挑选适合的 pv，还有一些选项，和上面的 pvc 配置是一样的
  accessModes: [ReadWriteMany]
  resources:
    requests:
      storage: 1G
```

:::tip
pvc 有 namespace，这代表它是分环境的。
:::

![](./images/2022-08-29-21-25-10.png)

**在 pods 中使用 pvc**

```yml
apiVersion: v1
kind: Pod
metadata:
  namespace: dev
  name: pod
spec:
  containers:
    - name: busybox
      image: busybox:1.30
      command: ['/bin/sh', '-c', 'touch /tmp/hello.txt; while true; do /bin/echo $(date +%T) >> /tmp/hello.txt; sleep 3; done;']
      volumeMounts:
        - mountPath: /tmp/
          name: volume
  volumes:
    - name: volume
      persistentVolumeClaim:
        # 这个名字是 pvc 的名字，这里的 pvc 名字就是 pvc
        claimName: pvc
        readOnly: false
```

## 配置存储

:::tips
TODO
:::

## 安全认证

:::tip
TODO
:::
