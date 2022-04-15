---
title: Docker-01-基本操作
categories:
- backend
tags:
- docker
author: causes
---

## 概述

docker 和传统的虚拟机不同，传统虚拟机是先虚拟出一套硬件，然后在硬件上运行一个操作系统，之后在操作系统上运行进程。

docker 中的进程直接运行在宿主内核中，容器中没有自己的内核，也没有虚拟的硬件，因此更加轻便，启动速度更快。

![](./images/2022-04-15-14-23-40.png)

![](./images/2022-04-15-14-23-44.png)

Docker 中有几个基本概念：

- 镜像：没有任何动态数据，可以看成是 Java 中类的概念。
- 容器：运行中的实体，可以看成是 Java 中，类实例化之后的对象。
- 仓库：仓库中包含多个标签，每一个标签赌赢一个镜像。
- Docker Repository：可以包含多个仓库。本质上是一个集中的存储、分发镜像的服务（最常用的是 Docker 官方推出的 Docker Hub）。

## 镜像

**获取**

Docker Hub 上有大量的镜像可以用，使用 `docker pull [options] [address [:port]/]仓库名称 [:tag]`，具体可以通过 `docker pull --help` 看到。

- Docker 地址格式为 `域名/IP :端口号`，默认的地址为 Docker Hub（`docker.io`）。
- 仓库名称格式：`用户名/软件名`，不指定则为官方镜像 `library`。

例如：`docker pull ubuntu:18.04` -> `docker.io/library/ubuntu:18.04`

**列出**

使用命令 `docker image` 列出已经下载下来的镜像。

```
[root@bigdata]~# docker images
REPOSITORY                                    TAG                 IMAGE ID            CREATED             SIZE
docker.io/gitea/gitea                         latest              423b8c425d76        4 weeks ago         241 MB
docker.io/jgraph/drawio                       latest              71f9c9180be6        8 weeks ago         531 MB
docker.io/rocket.chat                         latest              00e7c59a3559        2 months ago        828 MB
registry.rocket.chat/rocketchat/rocket.chat   latest              97cd6f80ccc2        2 months ago        879 MB
docker.io/diygod/rsshub                       latest              e8c178c7e38e        4 months ago        231 MB
docker.io/mongo                               4.0                 e305b5d51c0a        4 months ago        430 MB
docker.io/elasticsearch                       7.4.2               b1179d41a7b4        2 years ago         855 MB
docker.io/mobz/elasticsearch-head             5                   b19a5c98e43b        5 years ago         824 MB
```

其中包含了：仓库名称、标签、镜像 ID、创建时间、占用空间。

在这里，占用空间和 Docker Hub 中展示的可能不同，因为 Docker Hub 展示的是压缩之后的体积，在镜像下载和上传过程中是压缩状态。

---

可以通过命令 `docker system df` 可以查看当前镜像、容器、本地卷的占用空间

```
[root@bigdata]~# docker system df
TYPE                TOTAL               ACTIVE              SIZE                RECLAIMABLE
Images              8                   7                   4.751 GB            828.5 MB (17%)
Containers          8                   2                   173.2 MB            106.1 MB (61%)
Local Volumes       7                   4                   87.61 MB            87.6 MB (99%)
```

---

在镜像中，可能会有一些特殊镜像，仓库名和标签都为 `<none>`，可能会有很多原因导致（比如 build 失败、官方转移新镜像等），这些叫做虚悬镜像，没什么价值，可以删除。

---

::: details 基本操作示例
```shell
# 普通的 docker images 显示所有镜像
[root@bigdata]~# docker images
REPOSITORY                                    TAG                 IMAGE ID            CREATED             SIZE
docker.io/gitea/gitea                         latest              423b8c425d76        4 weeks ago         241 MB
docker.io/jgraph/drawio                       latest              71f9c9180be6        8 weeks ago         531 MB
docker.io/rocket.chat                         latest              00e7c59a3559        2 months ago        828 MB
registry.rocket.chat/rocketchat/rocket.chat   latest              97cd6f80ccc2        2 months ago        879 MB
docker.io/diygod/rsshub                       latest              e8c178c7e38e        4 months ago        231 MB
docker.io/mongo                               4.0                 e305b5d51c0a        4 months ago        430 MB
docker.io/elasticsearch                       7.4.2               b1179d41a7b4        2 years ago         855 MB
docker.io/mobz/elasticsearch-head             5                   b19a5c98e43b        5 years ago         824 MB
# 可以指定仓库，单独显示某个仓库下的镜像
[root@bigdata]~# docker images rocket.chat
REPOSITORY              TAG                 IMAGE ID            CREATED             SIZE
docker.io/rocket.chat   latest              00e7c59a3559        2 months ago        828 MB
# 指定仓库 + 标签显示镜像
[root@bigdata]~# docker images rocket.chat:latest
REPOSITORY              TAG                 IMAGE ID            CREATED             SIZE
docker.io/rocket.chat   latest              00e7c59a3559        2 months ago        828 MB
# 展示在 rocket.chat 这个镜像之后的镜像
[root@bigdata]~# docker images -f since=rocket.chat
REPOSITORY                TAG                 IMAGE ID            CREATED             SIZE
docker.io/gitea/gitea     latest              423b8c425d76        4 weeks ago         241 MB
docker.io/jgraph/drawio   latest              71f9c9180be6        8 weeks ago         531 MB
## 展示在 rocket.chat 之前的镜像
[root@bigdata]~# docker images -f before=rocket.chat
REPOSITORY                                    TAG                 IMAGE ID            CREATED             SIZE
registry.rocket.chat/rocketchat/rocket.chat   latest              97cd6f80ccc2        2 months ago        879 MB
docker.io/diygod/rsshub                       latest              e8c178c7e38e        4 months ago        231 MB
docker.io/mongo                               4.0                 e305b5d51c0a        4 months ago        430 MB
docker.io/elasticsearch                       7.4.2               b1179d41a7b4        2 years ago         855 MB
docker.io/mobz/elasticsearch-head             5                   b19a5c98e43b        5 years ago         824 MB
# 假如构建时指定了 label，可以通过它来展示镜像
[root@bigdata]~# docker images -f label=latest
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
# 只展示镜像 ID
[root@bigdata]~# docker images -q
423b8c425d76
71f9c9180be6
00e7c59a3559
97cd6f80ccc2
e8c178c7e38e
e305b5d51c0a
b1179d41a7b4
b19a5c98e43b
# 根据模板展示镜像，需要用到 Go 的模板语法: https://gohugo.io/templates/introduction/
[root@bigdata]~# docker image ls --format "{{.ID}}: {{.Repository}}"
423b8c425d76: docker.io/gitea/gitea
71f9c9180be6: docker.io/jgraph/drawio
00e7c59a3559: docker.io/rocket.chat
97cd6f80ccc2: registry.rocket.chat/rocketchat/rocket.chat
e8c178c7e38e: docker.io/diygod/rsshub
e305b5d51c0a: docker.io/mongo
b1179d41a7b4: docker.io/elasticsearch
b19a5c98e43b: docker.io/mobz/elasticsearch-head
```
:::

**删除**

使用 `docker rmi [options] 镜像1 [镜像2 镜像3 ……]`，其中镜像可以是 ID、名称等。

我们删除镜像时，其实是删除某个标签的镜像，所以首先满足条件的镜像都会取消标签，是 `Untagged` 操作，之后才会删除镜像。

但是假如一个镜像有多个标签，那么我们这个删除操作可能只是删除了某个标签而已，只有删除了所有的标签，才会触发删除行为。

还有一种情况，就是当一个容器使用这个镜像时，这个镜像不会删除，因为容器正在运行，而且容易以镜像为基础，所以不会删除。

我们也可以使用查询镜像命令来配合删除镜像：`docker rm $(docker images)`

## 容器

**基本操作**

- `docker run 镜像`：启动容器。
- `docker stop 容器`：终止容器。
- `docker start 容器`：启动已经终止的容器。
- `docker run -it 镜像 /bin/bash`：启动并进入容器，使用 bash 交互。
- `docker run -d 镜像`：后台运行，会返回容器 id。
- `docker logs 镜像`：获取容器输出。
- `docker rm 镜像`：删除镜像。

当启动容器时，运行过程包括：

1. 检查本地是否存在镜像，没有则下载。
1. 利用镜像创建并启动容器。
1. 分配文件系统，并在只读的镜像层外挂载一层可读可写层。
1. 从网桥接口中桥接一个虚拟接口到容器中。
1. 分配 ip 给容器。
1. 执行用户指定的程序。
1. 程序完成后终止。

所以可以看到，容器默认是一次性的，任务运行完成即终止，要想让容器不终止，需要一直保持执行状态。

**进入运行中的容器**

`docker exec -it 容器ID 终端`，例如：`docker exec -it adca7acf3c41 bash`。

其中 `-i` 表示即使没有连接，也要保持 STDIN 打开，`-t` 是分配伪终端。

**导入导出**

- `docker export 容器 > container.tar`：将容器导出为本地文件。
- `docker import container.tar test:1.0`：将本地文件导入为镜像，也可以指定某个 url 或者目录来导入。

## Dockerfile

Docker 镜像是一种分层结构，这种结构的好处是：多个镜像可能会用到某一个相同的层，这样就无需多次 pull。

那么对于镜像来说，即使 DockerHub 中有很多优秀镜像，但是不可能完全解决需求，因此我们需要自定义镜像。

Dockerfile 是一个文本文件，其内包含了一条条的 指令（Instruction），每一条指令构建一层，因此每一条指令的内容，就是描述该层应当如何构建。

**FROM**

定制镜像，肯定是以一个镜像为基础，而 `FROM` 关键字则指定了以哪一个镜像为基础。

有一些镜像可以直接拿来用，比如 `nginx`、`redis`、`mongo`、`tomcat` 等，也有一些方便开发使用，例如 `node`、`openjdk`、`python`，甚至还有一些系统镜像 `ubuntu`、`centos`、`debian` 等。

**RUN**

用于执行命令，有两种格式：

- `RUN 命令`：`RUN echo 'HELLO WORLD'`
- `RUN ['可执行文件', '参数', '参数']`

每个 `RUN` 都可以看做是一个新的进程执行环境，所以假如使用  

```shell
RUN cd /app
RUN echo "HELLO" > "world.txt"
```

其实不会进入到 `/app` 中去创建文件，结果是失败的。因为在 shell 中，这两条命令是处于同一个环境下的，但是在 docker 中，这是两个环境，第二个明显不会集成第一个。

要解决这个问题，需要使用 `WORKDIR`。

**构建镜像**

下面使用 `Dockerfile` 文件：

```
FROM nginx
RUN echo '<h1>HELLO Docker</h1>' > /usr/share/nginx/html/index.html
```

执行构建镜像命令：`docker build -t nginx:test .` 代表构建了一个镜像，名称为 `nginx`，标签为 `test`

镜像构建时，最后一个点，这个 `.` 代表的是当前目录，而 `Dockerfile` 就是当前目录，更确切的说，是在指定上下文环境。

提到上下文，首先要提到的就是 Docker 的架构。Docker = Docker 引擎（服务端守护进程）+ 客户端工具。

我们在执行命令时，本质上是通过客户端发送给 Docker 引擎，然后 Docker 引擎去执行命令。构建镜像的命令也是如此。

Docker 客户端会将上下文环境中指定下的所有内容都打包交给 Docker 引擎，然后 Docker 引擎去解析上下文环境中的内容进行构建。

之后我们还会学到 `COPY` ，假如指定 `COPY ./package.json /app/`，这条命令的意思是将上下文中的 `package.json` 放到 `app` 下，而不是 Dockerfile 文件所在位置或构建命令执行的位置下的 `package.json`。

假如我们对上下文环境错误地理解为 Dockerfile 所在的目录，有可能会出现 `COPY ../package.json` 失败的情况，因为这些路径已经超过了上下文环境的范围。

或者，假如有些人将 `Dockerfile` 文件直接放到了根目录下，那么就相当于将整个根目录打包送到 Docker 引擎，这样明显是错误的。

---

其实上下文和 `Dockerfile` 文件的所在位置并没有因果关系。

假如我们不指定 Dockerfile 文件，默认会将 `Dockerfile` 作为构建镜像的文件，而事实上，我们可以使用 `-f ../a.txt` 这种方式，手动指定某个文件。并且还可以额外指定上下文，但是上下文中必须能够找到指定的 `Dockerfile` 文件。

比如：`docker build -t nginx:v1 -f hello/a.txt .`

**COPY**

`COPY`，就是将文件从构建的上下文中拷贝到新的一层的镜像内的目标位置，可以使用 GO 的[通配符](https://pkg.go.dev/path/filepath#Match)表达式。例如：

```shell
COPY hom* /dir/
```

特别强调文件构建上下文，这里的上下文和 Dockerfile 所在位置并没有直接关系，只是说上下文中必须可以找到 Dockerfile 文件。

目标路径是容器内的路径，建议使用绝对路径，不过也可以使用相对路径，这个相对路径相对的是工作目录（使用关键字 `WORKDIR` 指定）。

在使用 COPY 命令时，目标的各种属性都会保留，例如权限、文件变更时间。在进行 GIT 管理的时候很有用。

可以使用 `--chown=<user>:<group>` 来变更所属用户和组，例如：

```shell
COPY --chown=causes:causes hom* /dir/
```

假如指定原路径为文件夹，那么不会复制文件夹，而是会将文件夹中的内容复制到目标路径下。

**ADD**

类似 COPY，但有所不同。它比 COPY 更加高级，比如原路径可以为一个 URL（下载后权限自动设为 600，更改则需要一层的 RUN 去调整）。

假如原路径为一个 tar 压缩文件，并且压缩格式为 `gzip`、`bzip2`、`xz` 之一，此命令会自动解压缩到目标路径上。

一般的最佳实践是：多用 COPY，少用 ADD。因为 COPY 功能单一，语义明确。ADD 虽然功能多一些，但是语义不明确，行为也不清晰。并且 ADD 会令镜像构建缓存失效，从而影响构建速度。

我们可以在文件复制时使用 COPY，仅在文件需要自动解压缩时使用 ADD。

**CMD**

CMD 的目的是在容器启动时指定容器启动程序和程序的参数，可使用两种方式：

```shell
# shell 格式，会被解析为 exec 格式，会主动包一层 `sh -c`，变为下面的 exec 格式
CMD "echo HELLO"
# exec 格式，推荐使用，注意一定要使用双引号（因为会被解析为 JSON 数组）
CMD ["sh", "-c", "echo HELLO"]
```

注意，Docker 和传统的虚拟机有所不同，容器中的应用没有后台服务的概念，都是在前台执行。容器是为了主进程存在的，主进程退容器就结束运行。

所以假如我们使用 `CMD service nginx start`，其实是在执行 `CMD ["sh", "-c", "service nginx start"]`，这里的主进程其实是 `sh`，并不是 `nginx`。

正确的做法是直接执行 nginx 可执行文件，并且要求以前台形式运行：`CMD ["nginx", "-g", "daemon: off;"]`。

我们也说过了，容器内没有后台应用的概念，所以传统守护进程服务 `daemon: on` 没有意义。在容器中想要运行则必须要一个前台进程。

另外，CMD 命令会被 `docker run` 带有的参数给覆盖掉，例如：

```shell
FROM ubuntu:18.04
CMD ["sh", "-c", "echo HELLO WORLD"]
```

构建为 `test:test`，运行时 `docker run test:test` 会输出 `HELLO WORLD`，但是参上参数 `docker run test:test echo HELLO DOCKER` 就会输出 `HELLO DOCKER`。

而且哪怕我们在 Dockerfile 中没有指定任何 CMD 命令，只要带上参数，那么就会覆盖为 CMD 命令。

**ENTRYPOINT**

目的也和 CMD 一样，在容器启动时指定需要的程序和程序对应的参数，但是指定它之后，CMD 的意义就发生了改变，不再是直接运行命令，而是作为参数传递给 `ENTRYPOINT`就是：`<ENTRYPOINT> "<CMD>"`

这样做的好处，就是可以将 CMD 执行后得到的参数再传递给 `ENTRYPOINT` 进行处理。

```shell
FROM ubuntu:18.04
ENTRYPOINT ["echo"]
```

当运行 `docker run test:test HELLO DOCKER` 时，`HELLO DOCKER` 会作为 CMD 传递给 `ENTRYPOINT`，最终输出。

`ENTRYPOINT` 也是可以覆盖的，只需要在 `docker run` 运行时带上 `--entrypoint="echo"` 就可以覆盖。

但是不管是哪种方式，最终在 `docker ps` 查看容器信息时，显示的都是最后运行的命令。

**ENV**

设置环境变量，格式有两种：

```shell
ENV <key> <value>
ENV <key1>=<value1> <key2>=<value2> ……
```

在这里定义之后，其他后面的指令都可以直接使用这里的定义。

**ARG**

类似 ENV，但区别是：不会在容器运行时看到这些值。但是不要保存敏感数据，因为 `docker history` 还是可以看到的。

注意，ARG 参数的生效范围截止到下一个 FROM，在下一个 FROM 之后假如还需要使用，那么必须再次指定。

```shell
ARG DOCKER_USERNAME=library

FROM ${DOCKER_USERNAME}/alpine

# 在FROM 之后使用变量，必须在每个阶段分别指定
ARG DOCKER_USERNAME=library

RUN set -x ; echo ${DOCKER_USERNAME}

FROM ${DOCKER_USERNAME}/alpine

# 在FROM 之后使用变量，必须在每个阶段分别指定
ARG DOCKER_USERNAME=library

RUN set -x ; echo ${DOCKER_USERNAME}
```

**VOLUME**

容器运行应该是无状态的，假如我们想要保存某些数据，那么就需要链接服务器目录和容器对应的目录（这种操作叫做挂载），这样即使容器挂掉，数据也不会丢失。

- Dockerfile 方式：

    ```shell
    FROM ubuntu:18.04
    # 使用 Dockerfile 文件时，只能指定容器内目录，不能指定宿主机目录，因为不能保证每个宿主机都会存在这种目录
    VOLUME ["/dockerContainerDir", "/dockerContainerDir2"]
    ```

- 匿名目录挂载：

    不显示指定宿主机的文件夹，会自动生成在 `/var/lib/docker/volumes` 下。

    `docker run -it -v <容器内目录>`

    假如出现权限问题，只需要多加 `--privileged=true` 即可

    运行命令可覆盖 Dockerfile 的配置

- 具名挂载：

    显示指定宿主机文件夹
    
    `docker run -it -v <宿主机目录>:<容器内目录>`

    假如出现权限问题，只需要多加 `--privileged=true` 即可

    运行命令可覆盖 Dockerfile 的配置

**EXPOSE**

声明容器运行时提供服务的端口，但是这只是个声明，不意味着开启这个端口的服务，只是提个醒。

和使用 `docker run -p` 不同，`EXPOSE` 不会去主动做映射，只是声明一下。

但是在使用 `docker run -P`（大写 P）时，会随机将 `EXPOSE` 的端口随机映射给宿主机端口。

可以使用：

```shell
EXPOSE 80
EXPOSE 80/tcp
EXPOSE 80/udp
EXPOSE <端口>/<协议>
```

**WORKDIR**

指定工作目录（当前目录），格式为 `WORKDIR <路径>`，如果不存在，Docker 会自动建立一个。

每个 `RUN` 都可以看做是一个新的进程执行环境，所以假如使用  

```shell
RUN cd /app
RUN echo "HELLO" > "world.txt"
```

其实不会进入到 `/app` 中去创建文件，结果是失败的。因为在 shell 中，这两条命令是处于同一个环境下的，但是在 docker 中，这是两个环境，第二个明显不会集成第一个。

要解决这个问题，需要使用 `WORKDIR /app`。`WORKDIER` 其实就是改变工作环境，假如执行命令存在相对路径，那么也是相对于 `WORKDIR`。

**USER**

改变之后命令执行时的身份。注意，这个用户必须是实现建立好的，否则是无法进行切换的。例如：

```shell
# 增加组 causes，并且修改用户的组
RUN groupadd -r causes && user -r -g causes causes
USER causes
```

假如是使用 root 执行的脚本，在这期间希望改变身份，那么不要使用 `su`、`sudo`。因为缺少 TTY 可能出错，且需要复杂配置，可以使用 `gosu`

**LABEL**

添加一些元数据：

```shell
LABEL <key>=<value> <key>=<value> <key>=<value>
```

**SHELL**

默认情况下使用 `/bin/sh -c`，可以使用 SHELL 来切换，例如：

```shell
SHELL ["/bin/sh", "-c"]
SHELL ["/bin/bash", "-c"]
```

指定之后，可以切换 CMD、RUN、ENTRYPOINT 使用的 shell。