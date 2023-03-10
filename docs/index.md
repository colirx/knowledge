---
home: true
heroImage: /img/more.png
heroText: 知识库
tagline: 文档站
bannerBg: none
postList: none

features:
  - title: base
    details: 基础
    link: /pages/da0ae6/
  - title: bigdata
    details: 大数据
    link: /pages/e71b43
  - title: backend
    details: 后端
    link: /pages/562fe9
---

## 使用到的技术点

**GitLab**

GitLab 提供代码的托管机制。

**CI**

用到的 CI 是 GitLab 自带的 CI，主要的实现方式就是文件 `.gitlab-ci.yml + Runner`。

公用的 Runner 需要填写银行卡信息，所以你们想要自己实现 CI 的时候最好自己搭一个。

::: tip
因为腾讯云服务器只有 1Mbps（128KB） 的速度，所以 CI 有可能因为网络原因（或者其他灵异事件）失败，重启一下试试。
:::

**VuePress**

生成静态博客的技术驱动。

同类型的有很多，比如 Hexo，Hugo 等，选择 VuePress 的考虑是使用 Vue 开发的，如果想自己搞一个什么页面都可以。

## 现在的问题

:::danger
文章中图片的引用使用相对路径，例如引用 `./images/1.png`，不可以写为 `/images/1.png`，因为这样写会找到公共文件夹下的 `images` 文件夹。
:::

:::danger
主题使用的是 [vuepress-theme-vdoing](https://github.com/xugaoyi/vuepress-theme-vdoing)，里面使用了 yarn format 作为配置，所以在写文章之前需要首先看一下基本的书写规则。
:::
