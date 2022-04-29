---
title: Zookeeper
category:
- bigdata
tag:
- zookeeper
author: causes
---

## 概述

[Zookeeper](https://zookeeper.apache.org/)，是一个开源的、分布式的、为分布式应用提供协调服务的 Apache 项目。简单来说，就是一剂润滑剂。

从设计模式的角度来理解，Zookeeper 是一个基于观察者模式设计的分布式服务管理框架，负责存储和管理重要的数据，然后接受观察者注册。

简单来说，Zookeeper = 文件系统 + 通知机制。

服务的场景包括：统一命名、统一配置管理、统一集群管理、服务器节点动态上下线、软负载均衡等。

**Zookeeper 特点**

1. 一个 leader，多个 follower。
1. 集群中只要有半数以上的节点存活，Zookeeper 就能正常提供服务。
1. Zookeeper 的数据全局一致。无论客户端连接到哪个节点的服务，都会得到相同的数据。
1. 来自一个客户端的请求按照发送顺序依次执行。
1. 数据更新是原子性的，一次的数据更新要么成功，要么失败，没有更新半截的情况。
1. 实时性，在一定的时间范围内，客户端可以读取到最新数据。

**数据结构**

Zookeeper 数据结构类似 Unix 文件系统，整体上可以看成一棵树，每个节点叫做 `ZNode`。每个 ZNode 默认可以存储 1MB 的数据，每个 ZNode 都可以通过其路径唯一标识。

## 安装部署

**本地安装**

1. 准备 JDK
1. 拷贝 Zookeeper 到 Linux 中，解压到指定目录，配置环境变量。
1. 修改 `conf` 目录下的配置文件 `zoo_sample.cfg` 为 `zoo.cfg`，并且修改如下内容：

    ```
    dataDir=/opt/module/apache-zookeeper-3.5.7/zkData
    ```

1. 操作 Zookeeper：
    1. 启动：`bin/zkServer.sh start`
    1. 使用 jps，查看是否启动了进程 `QuorumPeerMain`。
    1. 查看状态：`bin/zkServer.sh status`
    1. 启动客户端：`bin/zkCli.sh`
    1. 退出客户端：`quit`
    1. 停止 Zookeeper：`bin/zkServer.sh stop`

**配置参数介绍**

```shell
# 通信心跳数，Zookeeper 服务器和客户端的心跳时间，毫秒值
tickTime=2000
# Leader - Follower 初始通信时限
initLimit=10
# Leader - Follower 同步通信时限
syncLimit=5
# 数据文件目录 + 数据持久化路径
dataDir=/opt/module/apache-zookeeper-3.5.7/zkData
# 客户端链接端口
clientPort=2181
```

**分布式安装**

1. 解压 Zookeeper3.5.7 到对应的 `/opt/module` 下，配置好环境变量。
1. 在 `$ZOOKEEPER_HOME` 下创建 zkData 文件夹。
1. 创建文件名为 `myid` 的文件，给 hadoop102 配置为 2，hadoop103 配置为 3，hadoop104 配置为 4。
1. 配置 zoo.cfg 文件：

    将 `$ZOOKEEPER_HOME/conf` 下的 `zoo_sample.cfg` 改为 `zoo.cfg`

    修改 `dataDir=/opt/module/zookeeper-3.5.7/zkData`

    增加配置：

    ```shell
    #######################cluster##########################
    server.2=hadoop102:2888:3888
    server.3=hadoop103:2888:3888
    server.4=hadoop104:2888:3888
    ```

    配置 `server.A=B:C:D`：

    - 其中 A 是服务器编号，在集群模式下配置一个 `myid` 的文件，这个文件在 `dataDir` 下，配置的数据就是这个 A 的值
    - B 是服务器地址。
    - C 是服务器的 Follower 和集群中 Leader 交换信息的端口。
    - D 是 Leader 重选时相互通信端口，避免 Leader 挂掉之后没有 Leader 可用的情况。

1. 分别启动 Zookeeper：`bin/zkServer.sh start`
1. 查看状态：`bin/zkServer.sh status`

## 快速开始

### 客户端命令行

客户端命令行基本语法：

| 命令基本语法 | 功能描述                                                          |
| ------------ | ----------------------------------------------------------------- |
| help         | 显示所有操作命令                                                  |
| ls path      | 查看 `znode` 的子节点；`-w` 可以监听子节点变化；`-s` 查看次级信息 |
| create       | 普通创建；`-s` 含序列创建；`-e` 临时创建，重启或者超时消失        |
| getPath      | 获得节点的值；`-w` 监听节点内容变化；`-s` 附加次级信息            |
| set          | 设置节点的具体指                                                  |
| stat         | 查看节点状态                                                      |
| delete       | 删除节点                                                          |
| deleteall    | 递归删除节点                                                      |

```shell
# 查看当前节点
[zk: localhost:2181(CONNECTED) 0] ls /
[zookeeper]
# 查看当前节点，附加次级节点
[zk: localhost:2181(CONNECTED) 1] ls -s /
[zookeeper]cZxid = 0x0
ctime = Thu Jan 01 08:00:00 CST 1970
mZxid = 0x0
mtime = Thu Jan 01 08:00:00 CST 1970
pZxid = 0x0
cversion = -1
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 0
numChildren = 1
# 创建一个节点，并且给定值
[zk: localhost:2181(CONNECTED) 2] create /sanguo "diaochan"
Created /sanguo
# 在 sanguo 节点下创建一个节点，并且给定值
[zk: localhost:2181(CONNECTED) 3] create /sanguo/shuguo "liubei"
Created /sanguo/shuguo
# 获取节点值
[zk: localhost:2181(CONNECTED) 4] get /sanguo
diaochan
# 获取节点值，并且附加次级信息
[zk: localhost:2181(CONNECTED) 6] get -s /sanguo/shuguo
liubei
cZxid = 0x7
ctime = Tue Mar 29 15:56:30 CST 2022
mZxid = 0x7
mtime = Tue Mar 29 15:56:30 CST 2022
pZxid = 0x7
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 6
numChildren = 0
```

```shell
# 创建一个临时节点
[zk: localhost:2181(CONNECTED) 7] create -e /sanguo/wuguo "zhouyu"
Created /sanguo/wuguo
# 在当前客户端可以查看
[zk: localhost:2181(CONNECTED) 8] ls /sanguo
[shuguo, wuguo]
# 使用 quit 退出再重新登录，临时节点已经删除了
[zk: localhost:2181(CONNECTED) 0] ls /sanguo
[shuguo]
```

```shell
# 创建一个普通的节点
[zk: localhost:2181(CONNECTED) 1] create /sanguo/weiguo "caocao"
Created /sanguo/weiguo
# 再次创建时，显示已经存在了这个节点，不允许再次创建
[zk: localhost:2181(CONNECTED) 2] create /sanguo/weiguo "caocao"
Node already exists: /sanguo/weiguo
# 创建一个带序号的节点
[zk: localhost:2181(CONNECTED) 3] create -s /sanguo/weiguo "caocao"
Created /sanguo/weiguo0000000003
# 查看节点，发现已经有了带序号的节点
[zk: localhost:2181(CONNECTED) 4] ls /sanguo
[shuguo, weiguo, weiguo0000000003]
```

```shell
# 修改节点值
[zk: localhost:2181(CONNECTED) 2] set /sanguo/weiguo "caopi"
```

### API 使用

1. 环境搭建：

    ```xml
    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>RELEASE</version>
        </dependency>
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-core</artifactId>
            <version>2.8.2</version>
        </dependency>
        <dependency>
            <groupId>org.apache.zookeeper</groupId>
            <artifactId>zookeeper</artifactId>
            <version>3.5.7</version>
        </dependency>
    </dependencies>
    ```

1. `log4j.properties`

    ```properties
    log4j.rootLogger=INFO, stdout
    log4j.appender.stdout=org.apache.log4j.ConsoleAppender
    log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
    log4j.appender.stdout.layout.ConversionPattern=%d %p [%c] - %m%n
    log4j.appender.logfile=org.apache.log4j.FileAppender
    log4j.appender.logfile.File=target/spring.log
    log4j.appender.logfile.layout=org.apache.log4j.PatternLayout
    log4j.appender.logfile.layout.ConversionPattern=%d %p [%c] - %m%n
    ```

    注意一点，log4j 的漏洞问题，非个人项目需要注意。

1. API

    ```java
    public class Zookeeper {

    private String connectString;
    private int sessionTimeout;
    private ZooKeeper zkClient;

    /**
    * 获取客户端对象
    */
    @Before
    public void init() throws IOException {

        connectString = "hadoop102:2181,hadoop103:2181,hadoop104:2181";
        sessionTimeout = 10000;

        /*
        1. 集群连接字符串
        2. 连接超时时间，单位为毫秒
        3. 当前客户端默认的监控器
        */
        zkClient = new ZooKeeper(connectString, sessionTimeout, new Watcher() {
        @Override
        public void process(WatchedEvent event) {
        }
        });
    }

    @Test
    public void create() throws InterruptedException, KeeperException {
        /*
        1. path: 节点路径
        2. data: 节点内容，需要 byte
        3. acl: 对操作用户的权限控制
        4. createMode: 持久化选项
            - PERSISTENT：持久的
            - PERSISTENT_SEQUENTIAL：持久带序列
            - EPHEMERAL：临时的
            - EPHEMERAL_SEQUENTIAL：临时带序列
        */
        zkClient.create("/sanguo", "guanyu".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);
    }

    /**
    * 获取子节点列表，不监听
    */
    @Test
    public void ls() throws InterruptedException, KeeperException {
        List<String> children = zkClient.getChildren("/", false);
        System.out.println(children);
    }

    /**
    * 获取子节点列表并监听
    */
    @Test
    public void lsAndWatch() throws InterruptedException, KeeperException {
        List<String> children = zkClient.getChildren("/", new Watcher() {
        @Override
        public void process(WatchedEvent watchedEvent) {
            System.out.println("结果发生变化");
        }
        });
        System.out.println(children);
        // 因为设置了监听，所以当前线程不能结束
        Thread.sleep(Long.MAX_VALUE);
    }

    /**
    * 判断 node 是否存在
    */
    @Test
    public void exist() throws InterruptedException, KeeperException {
        String path = "/sanguo";
        Stat stat = zkClient.exists(path, false);
        boolean isExit = Objects.isNull(stat);
        System.out.printf("%s %s%n", path, isExit ? "not exist" : "exist");
    }

    /**
    * 获取节点数据，不监听
    */
    @Test
    public void getData() throws InterruptedException, KeeperException {
        String path = "/sanguo";
        Stat stat = zkClient.exists(path, false);
        if (Objects.isNull(stat)) {
        System.out.printf("%s not exist", path);
        return;
        }
        byte[] data = zkClient.getData(path, false, stat);
        System.out.println(new String(data));
    }

    /**
    * 获取节点数据并监听
    */
    @Test
    public void getDataAndWatch() throws InterruptedException, KeeperException {
        String path = "/sanguo";
        Stat stat = zkClient.exists(path, false);
        if (Objects.isNull(stat)) {
        System.out.printf("%s not exist", path);
        return;
        }
        byte[] data = zkClient.getData(path, new Watcher() {
        @Override
        public void process(WatchedEvent watchedEvent) {
            System.out.println("节点变化……");
        }
        }, stat);
        System.out.println(new String(data));
        Thread.sleep(Long.MAX_VALUE);
    }

    /**
    * 设置节点数据
    */
    @Test
    public void setData() throws InterruptedException, KeeperException {
        String path = "/sanguo";
        Stat stat = zkClient.exists(path, false);
        if (Objects.isNull(stat)) {
        System.out.printf("%s not exist", path);
        return;
        }
        /*
        1. 节点路径
        2. 节点新值
        3. 节点版本号
        */
        zkClient.setData(path, "liubei".getBytes(), stat.getVersion());
    }

    /**
    * 删除空节点
    */
    @Test
    public void deleteNullNode() throws InterruptedException, KeeperException {
        String path = "/a";
        Stat stat = zkClient.exists(path, false);
        if (Objects.isNull(stat)) {
        System.out.printf("%s not exist", path);
        return;
        }
        zkClient.delete(path, stat.getVersion());
    }

    /**
    * 递归删除节点，可以删除非空节点
    */
    @Test
    public void deleteNode() throws InterruptedException, KeeperException {
        deleteAll("/sanguo");
    }

    public void deleteAll(String path) throws InterruptedException, KeeperException {
        Stat stat = zkClient.exists(path, false);
        if (Objects.isNull(stat)) {
        return;
        }
        List<String> children = zkClient.getChildren(path, false);
        if (children.isEmpty()) {
        zkClient.delete(path, stat.getVersion());
        return;
        }
        children.forEach(child -> {
        try {
            deleteAll(String.format("%s/%s", path, child));
        } catch (InterruptedException | KeeperException e) {
            e.printStackTrace();
        }
        });
        // 注意最后不要忘记删除当前节点
        zkClient.delete(path, stat.getVersion());
    }

    /**
    * 关闭客户端对象
    */
    @After
    public void close() throws InterruptedException {
        zkClient.close();
    }
    }
    ```

## Zookeeper 内部原理

**内部节点**

Zookeeper 内部节点有：

- 持久型节点 PERSISTENT：客户端和服务器断开连接之后，节点不删除。
- 临时型节点 EPHEMERAL：客户端和服务器断开连接之后，节点删除。


|        | 持久型节点 PERSISTENT | 临时型节点 EPHEMERAL   |
| ------ | --------------------- | ---------------------- |
| 编号   | 持久化目录节点        | 持久化顺序编号目录节点 |
| 不编号 | 临时目录节点          | 临时顺序编号目录节点   |

在创建顺序标识时，顺序号是一个单调递增计数器，由父节点进行维护。

在分布式系统中，顺序号可以被用于全局排序，这样客户端可以根据顺序号推断事件的顺序。

**结构体 Stat**

1. czxid：数据节点被创建节点的事务 id。

    每次修改 zookeeper 的状态都会收到一个 zxid 形式的时间戳，也就是 zookeeper 事务 id。每个修改都有唯一的 zxid。

    加入 zxid1 < zxid2，那么 zxid1 在 zxid2 之前发生。

1. ctime：znode 被创建的毫秒数，从 1970 年开始。
1. mzxid：最后更新的事务 zxid。
1. mtime：最后修改的毫秒数，从 1970 年开始。
1. pZxid：znode 最后更新的子节点 zxid。
1. cversion：znode 最后修改的版本号，修改次数。
1. dataversion：znode 数据变化号。
1. aclVersion：znode 访问控制列表的变化号。
1. ephemeralOwner：假如不是临时节点则为 0，假如是临时节点则为拥有者的 session id。
1. dataLength：znode 数据长度。
1. numChildren：znode 子节点数量。

**监听器原理**

1. 在主线程中创建 zookeeper 客户端，这时会创建两个线程：connect 网络连接通信、listener 监听。
1. connect 线程会将注册的监听事件发送给 zookeeper。
1. zookeeper 的注册监听器会将监听事件添加到监听列表中。
1. zookeeper 监听到事件，发送给 listener 线程。
1. listener 内部调用 process()

![](./images/2022-04-03-23-31-17.png)

**选举机制**

半数机制：在 zookeeper 中有半数以上的机器存活，则正常提供服务。所以 zookeeper 适合安装奇数台服务器。

zookeeper 没有在配置文件中指定 master 和 slave，但是在工作时有一个是 lead，其他都是 follower，这是选举决定的。

现在有 5 台机器，模拟选举机制过程：

1. 服务器 1 启动：

    服务器 1 发起一次选举，投自己一票。此时服务器 1 一票，不够半数以上，选举无法完成，服务器 1 保持状态为 LOOKING。

1. 服务器 2 启动：

    服务器 2 发起一次选举，服务器 1 和服务器 2 分别投自己一票，并且交换选票信息。

    服务器 1 发现服务器 2 的 id 高于自己，将选票交给服务器 2。

    此时服务器 1 为 0 票，服务器 2 为 2 票，不够半数以上，两者均保持为 LOOKING。

1. 服务器 3 启动：

    类似上一个步骤，服务器 1、2 会将选票交给服务器 3，此时服务器 1、2 为 0 票，服务器 3 为 3 票。

    票数达到半数以上，服务器 3 当选 Leader，服务器 1、2 更改状态为 FOLLOWING。

    服务器 3 改变状态为 LEADING。

1. 服务器 4、5 启动，分别发起选举，但是此时服务器 1、2、3 都不是 LOOKING 状态，最后交换选票信息之后成为 FOLLOWING 状态。

**写数据流程**

1. 客户端向 Zookeeper 上的 Server1 写数据，发送一个请求。
1. 假如 Server1 非 Leader，则会将请求转交给 Leader。
1. Leader 广播请求给 Follower。
1. 各个 Follower 将请求加入待写队列，并发送给 Leader 消息。
1. 当 Leader 收到半数以上 Follower 的信息，则说明写操作可以执行，Leader 会向各个 Follower 发送提交信息，各个 Follower 会落实队列中的写请求。
1. Server1 返回客户端写操作成功的消息。
