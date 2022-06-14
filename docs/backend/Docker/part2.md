---
title: Docker-02-进阶
categories:
- backend
tags:
- docker
author: causes
---

## Docker Hub

在 [Docker Hub](https://hub.docker.com/) 中存在大量成熟的镜像，可以直接使用。

可以使用 `docker search` 找寻成熟度的镜像，例如：`docker search nginx`。有关键字：`OFFICIAL（官方创建）`。

也可以在登陆之后，使用 `docker push` 将自己的镜像推送到 docker hub：`docker tag <推送到docker hub 上的镜像名称>:<标签> <username>/<镜像名称>:<标签>`。

也可以使用 `docker-registry` 构建私人镜像仓库，使用镜像 `registry` 即可，或者一步到位，直接使用 [nexus](https://www.sonatype.com/products/repository-oss-download) 来管理 docker，顺便把 maven、yum、pypi 也管了。

## Docker 网络

Docker 提供网络服务有两种方式：

1. 外部访问容器（端口映射）
1. 容器互联（docker 网络）

**端口映射**

端口映射，其实就是将宿主机的端口和 docker 端口链接，进而达到访问宿主机端口直接进入到 docker 容器端口的效果。

在 `docker run` 时，可以通过 `-p` 和 `-P` 来进行端口映射，使用 `-p` 可以指定需要映射的端口，例如：`docker run -p 8080:8888`，这样宿主机的 `8080` 就映射到 docker 的 `8888`。

还可以直接指定地址和协议，比如：`docker run -p 127.0.0.1:8080:8888/tcp`，可以多次使用 `-p` 绑定多个端口。

映射完成之后，可以使用 `docker port ${dockerContainer}` 查看配置。

**容器互联**

可以创建一个 Docker 网络，加入此网络的容器可以相互访问。如果有多个容器互相连接的需求，那么 `docker compose` 是更好的选择。

- 新建 docker 网络：`docker network create -d bridge docker-net`

    `-d` 可以指定参数 `bridge`、`overlay`。其中 `overlay` 用于 swarm 这个容器编排工具。

- 启动容器，并且将容器加入到 docker 网络中：`docker run -d --name nginx1 --network docker-net nginx:latest`

- 列出网络：`docker network ls`

    docker 会自动创建三个网络：`bridge`、`host`、`none`

    | 网络   | 说明                                                         |
    | ------ | ------------------------------------------------------------ |
    | bridge | 为每个容器分配、设置 IP，并且连接到 `docker0` 上，是默认模式 |
    | host   | 容器将使用宿主机 IP 和端口                                   |
    | none   | 不联网                                                       |

- 查看某网路的详细信息：`docker inspect bridge`

## Docker Compose

### 介绍与安装

[Docker Compose](https://github.com/docker/compose)，Docker 官方的容器编排项目，他可以让多个容器互相配合完成任务，比 Dockerfile 更好。

允许用户通过一个单独的文件 `docker-compose.yml` 来定义一组相互关联的容器作为一个项目。

概念：

- `service` 服务：多个运行相同镜像的容器称为服务。
- `project` 项目：一组关联的应用容器组成的完整业务单元。

`docker-compose` 可以直接从官方 [release](https://github.com/docker/compose/releases) 包下载安装。

```shell
sudo curl -L https://download.fastgit.org/docker/compose/releases/download/1.27.4/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Docker 重写了 Docker Compose，称为 Compose V2，之后升级的时候可以使用 `docker compose` 代替 `docker-compose`。

### 命令

**help**

使用 `docker-compose [COMMAND] --help` 或 `docker-compose help [COMMAND]` 即可查看某个命令的使用格式。

**命令选项**

- `-f, --file File`：指定使用的 compose 模板文件，默认为 `docker-compose.yml`。
- `-p, --project-name [name]`：指定项目名称，默认使用所在目录作为项目名。
- `--verbose`：输出更多调试信息。
- `-v, --version`：打印版本并退出。

**build**

构建项目中的服务容器，选项：

- `--force-rm`：删除构建中的临时容器。
- `--no-cache`：构建过程不进行缓存。
- `--pull`：始终尝试获取更新版本的镜像。

**config**

验证 docker compose 文件格式是否正确，错误显示错误原因，正确显示配置。

**up**

自动构建镜像、创建服务、增加网络、关联服务相关容器等操作。

- `-d`：后台运行容器。
- `--force-recreate`：强制重新创建容器，不可与 `--no-recreate` 同时使用。
- `--no-recreate`：容器存在则不创建。
- `--no-build`：不自动构建缺失的镜像。

**down**

停止 `docker compose up` 启动的容器，移除网络。

**version**

查看版本。

**exec**

进入指定容器。

**images**

列出 compose 文件中包含的镜像。

**kill**

`docker compose kill [service]`

强制杀掉容器。

**logs**

`docker compose logs [service]`

查看服务容器的输出。

**pause**

`docker compose pause [service]`

暂停一个服务容器。

**unpause**

恢复处于暂停状态的服务。

**port**

`docker compose port [service] [port]`

映射端口。

- `--protocol=proto`：指定协议，默认为 tcp。
- `--index=index`：若同一服务有多个容器，则指定命令对象容器的编号，默认为 1。

**ps**

列出所有容器。

**pull**

拉取服务依赖的镜像。

**push**

推送服务依赖的镜像到 docker 仓库。

**rm**

删除所有停止状态的容器。

**run**

`docker compose run ubuntu ping docker.com`

在指定服务（没有则启动）上执行一个命令。

- `-d`：后台启动。
- `--name [name]`：指定容器名称。
- `--entrypoint [command]`：覆盖默认的容器启动指令。
- `-e [KEY=VAL]`：指定环境变量，可多次指定。
- `-u`：指定运行容器的用户。
- `-p`：映射端口。

**start**

启动已存在的容器。

**restart**

`docker compose restart [service]`

重启服务。

- `-t，--timeout [timeout]`：指定超时时间，默认 10s。

**stop**

停止已经运行的容器，但不删除。

**top**

查看各个服务容器内运行的进程。

### 模板文件

[模板文件](https://docs.docker.com/compose/compose-file/)是核心，有了一个模板文件，大部分命令都可以直接配置，然后一个 `docker compose run` 启动即可。默认模板文件为 `docker-compose.yml`。

每个服务都必须指定镜像，可以使用 image 指令，也可使用 build（需要 Dockerfile） 指定，使用 Dockerfile 时，所有的 CMD、EXPOSE、VOLUME、ENV 等会自动被捕获，不用在 `docker-compose.yml` 再次指定。

例如：

```yml
version: "3"

services:
  webapp:
    image: examples/web
    ports:
      - "80:80"
    volumes:
      - "/data"
```

或 

```yml
version: '3'
services:
  webapp:
    build: ./dir
```

**image**

指定镜像，不存在则会拉取。

**build**

使用 build 时，可以指定绝对/相对路径，甚至可以使用 `context` 指定 Dockerfile 所在文件夹的路径，也可以使用 `arg` 来指定构建镜像的变量，可以使用 `cache_from` 指定构建镜像的缓存。

```yml
version: '3'

services:
  webapp:
    build:
      context: ./dir
      dockerfile: Dockerfile-alternate
      args:
        buildno: 1
    cache_from:
      - alpine:latest
      - corp/web_app:3.14
```

**labels**

指定元数据信息。

```yml
labels:
  com.startupteam.description: "webapp for a startup team"
  com.startupteam.department: "devops department"
  com.startupteam.release: "rc3 for v1.0"
```

**network_mode**

设置网络模式。

```yml
network_mode: "bridge"
network_mode: "host"
network_mode: "none"
network_mode: "service:[service name]"
network_mode: "container:[container name/id]"
```

**networks**

配置容器连接的网络。

```yml
version: "3"

services:
  some-service:
    networks:
      - some-network
      - other-network

networks:
  some-network:
  other-network:
```

**ports**

暴露端口信息。

```yml
ports:
  - "3000"
  - "8000:8000"
  - "49100:22"
  - "127.0.0.1:8001:8001"
```

**volumes**

指定容器数据卷。

```yml
volumes:
 - /var/lib/mysql
 - cache/:/tmp/cache
 - ~/configs:/etc/configs/:ro
```

**command**

`command: echo "HELLO WORLD"`

覆盖容器启动后默认执行的命令。

**cgroup_parent**

`cgroup_parent: cgroups_1`

指定父 cgroup，继承此组资源限制。

**container_name**

`container_name: docker-web-container`

指定容器名称，默认名称是 `项目名称_服务名称_序号`。指定后，此项目无法扩展，因为 Docker 不允许多个容器有相同的名称。

**读取变量**

将使用系统环境变量和当前目录下的 `.env` 文件中的变量。

```yml
version: "3"

services:
  db:
    image: "mongo:${MONGO_VERSION}"
```

**depends_on**

指定启动顺序，这个例子中会先启动 redis、db，之后启动 web。

```yml
version: '3'

services:
  web:
    build: .
    depends_on:
      - db
      - redis

  redis:
    image: redis

  db:
    image: postgres
```

**dns**

自定义 DNS 服务器，可以是一个值，可以是一个列表。

```yml
dns: 8.8.8.8

dns:
  - 8.8.8.8
  - 114.114.114.114
```

**env_file**

从文件中获取环境变量，若冲突，则后者覆盖前者。

```yml
env_file: .env

env_file:
  - ./common.env
  - ./apps/web.env
  - /opt/secrets.env
```

环境变量文件：

```shell
# common.env: Set development environment
PROG_ENV=development
```

**environment**

声明环境变量，环境变量可自动获取 compose 主机上对应的值，可以避免泄露数据。

```yml
environment:
  RACK_ENV: development
  SESSION_SECRET:

environment:
  - RACK_ENV=development
  - SESSION_SECRET
```

布尔值需要放到引号中，包括：`y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF`

**expose**

暴露端口，但不映射到宿主机。

```yml
expose:
 - "3000"
 - "8000"
```

**extends**

继承其他的文件，必须也符合 docker-compose 文件格式。


- `docker-compose-common.yml`

    ```yml
    version: '3'

    services:
      web: 
        image: example/web-common:latest
    ```

- `docker-compose.yml`

    ```yml
    version: '3'

    services:
      worker:
        extends:
            file: docker-compose-common.yml
            service: web
    ```
