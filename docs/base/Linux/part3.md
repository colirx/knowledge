---
title: Linux-03-安装配置
category:
- base
tag:
- linux
author: causes
---

## RPM 包的管理

### RPM 介绍

rpm 用于互联网下载包的打包和安装工具，它包含在某些 Linux 发行版中。

它生成具有 .RPM 扩展名的文件。RPM 是 RedHat Package Manager（RedHat 软件包管理工具）的缩写，类似 Windows 的 setup.exe。

### RPM 包的管理

- `rpm` 包的简单查询指令：

    查看已经安装的 rpm 列表：`rpm -qa | grep xx`

    举例：查看当前系统是否安装了 firefox：`rpm -qa | grep firefox`

    一个 rpm 包名包含：
        - 一个包名：`firefox-60.2.2-1.el7.centos.x86_64`
        - 名称：`firefox`
        - 版本号：`60.2.2-1`
        - 适用操作系统：`centos.x86_64`

    如果是 `i686`、`i386` 表示 32 位系统，`noarch` 表示通用。

- rpm 包的其他指令：
    - `rpm -qa`：查询所安装的所有 rpm 软件包。
    - `rpm -qi 软件包名`：查询软件包信息。
    - `rpm -ql 软件包名`：查询软件包里的文件。
    - `rpm -qf 文件全路径名`：查询文件所属的软件包。

- 卸载 RPM 包
    - 基本语法：`rpm -e 软件包名称`，比如：`rpm -e firefox` 。

    假如其他软件包依赖于这次要卸载的软件包，它可能会出现错误信息。
    假如要强制删除此软件包，使用：`rpm -e --nodeps 软件包名`。

- 安装 rpm 包：
  - 基本语法：`rpm -ivh rpm包全路径名称`，比如：`rpm -ivh /xxx/firefox`
  - 参数说明：
    - i = install：安装。
    - v = verbose：提示。
    - h = hash 进度条。

## YUM

### YUM 介绍

yum，一个 Shell 前端软件包管理器，基于 RPM 包管理，能够自动从指定的服务器中下载 RPM 包并进行安装，可以自动处理依赖关系，并且一次性安装所有依赖软件包。

### YUM 指令

- yum 的基本指令：
  - `yum list | grep xxx`：查询 yum 服务器是否有需要安装的软件。
  - `yum install xxx`：下载安装软件，比如：`yum -y install firefox`。

## 搭建 JavaEE 环境

### 环境介绍

如果需要在 Linux 环境下进行 JavaEE 的开发，则需要如下软件：

- IDEA
- Apache-Tomcat
- MySQL
- JDK

### 安装 JDK

1. `mkdir /opt/jdk`
1. 通过 xftp6 上传到 `/opt/jdk` 下。
1. `cd /opt/jdk`
1. 解压 `tar -zxvf jdk-8u-xxx`
1. `mkdir /usr/local/java`
1. `mv /opt/jdk/jdk1.8.0xxx /usr/local/java`
1. `vim /etc/profile`
1. 编辑对应的内容：

    ```shell
    export JAVA_HOME=/usr/local/java/jdk1.8.0xxx
    export PATH=$JAVA_HOME/bin:$PATH
    ```

    `$JAVA_HOME/bin:$PATH` 后面一定要将 `$PATH` 带进去，假如不加这个，那么 PATH 将只剩下这一个路径了，原先的环境变量就给破坏了。

1. `source /etc/profile`：让文件生效。
1. 测试是否安装成功，编写一个简单的 Hello.java 输出 Hello World。

### 安装 tomcat

1. 上传安装文件，并且解压至 `/opt/tomcat`
1. 进入解压目录 `/bin`，启动tomcat：`./startup.sh`
1. 开放端口 `8080`
1. 测试是否安装成功：在 windows/linux 下面访问 `http://linuxip:8080`

### 配置 MySQL5.7

1. 新建文件夹`/opt/mysql`，然后进入。
1. 通过网络获取 MySQL 安装包。

    ```shell
    wget http://dev.mysql.com/get/mysql-5.7.26-1.el7.x86_64.rpm-bundle.tar
    ```

1. 解压 `tar -xvf xxx.tar`
1. 运行 `rpm -qa | grep mari`，查询 mariadb 相关安装包。
1. 运行 `rpm -e --nodeps mariadb-libs`，卸载。
1. 然后开始真正安装 MySQL，依次运行如下几条命令：

    ![2021-08-16-22-08-03](./images/2021-08-16-22-08-03.png)

1. 运行`systemctl start mysqld.service`，启动 MySQL
1. 开始设置 root 用户密码。

    MySQL 会自动给 root 用户设置用户密码，运行`grep "password" /var/log/mysqld.log`可以查看当前密码

1. 运行 `mysql -uroot -p`，用 root 用户登录，输入上述密码，可以成功进入 MySQL 命令行。
1. 可以重设 root 密码，对于个人开发环境要设置简单密码即可。

    可以运行 `set global validate_password_policy=0` 提示密码设置策略。

    `validate_password_policy`默认为 1。

    MySQL 密码复杂度有三种：

    - 低：0 or low：只要求长度（默认为8位）。
    - 中：1 or MEDIUM：要求长度、数字、大小写和特殊字符。
    - 高：2 or STRONG：要求长度、数字、大小写、特殊字符和字典文件。

1. `set password for 'root'@'localhost'=password('密码')`。
1. 运行 `flush privileges` 使密码生效。
