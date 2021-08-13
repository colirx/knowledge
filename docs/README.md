---
home: true
heroText: 团队博客
tagline: 群策群力
actions:
features:
- title: GitLab
  details: GitLab 提供代码的托管机制。
- title: CI
  details: 持续集成。
- title: VuePress
  details: 生成静态博客的技术驱动。
  footer: VuePress 提供驱动
footer: MIT Licensed | Copyright © 2018-present Evan You
---

## 技术驱动

**GitLab**
```
GitLab 提供代码的托管机制。
```

**VuePress**
```
用到的 CI 是 GitLab 自带的 CI，主要的实现方式就是文件 `.gitlab-ci.yml` + Runner。  
公用的 Runner 需要填写银行卡信息，所以你们想要自己实现 CI 的时候最好自己搭一个，不难。   
现在 teams 的 Runner 放到了腾讯云服务器上，假如你们想要集成 Jekins 或者其他的工具，我没搞过不能给建议。
```

**CI**

```
生成静态博客的技术驱动。
同类型的有很多，比如 Hexo，Hugo 等，选择 VuePress 的考虑是使用 Vue 开发的，如果想自己搞一个什么页面都可以。
```

## 灵异事件的解决方式

因为腾讯云服务器只有 1Mbps（128KB） 的速度，所以 CI 有可能因为网络原因（或者其他灵异事件）失败，重启一下试试。

## 现在的问题

VuePress 并不是像传统的博客一样定义分类，然后在各个分类下编写页面，而是可以多层文件夹嵌套来编写内容。所以现在无法像传统意义上进行文章的分类。  
这样的编写方式就表示我们的内容无法像传统意义上的博客系统一样
