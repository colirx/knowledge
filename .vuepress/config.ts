import { defineUserConfig } from "vuepress";
import type { DefaultThemeOptions } from "vuepress";
import recoTheme from "vuepress-theme-reco";

export default defineUserConfig({
  title: "知识手册",
  theme: recoTheme({
    style: "@vuepress-reco/style-default",
    logo: "/logo.png",
    author: "causes",
    authorAvatar: "/head.png",
    docsRepo: "https://gitlab.com/team401/knowledge",
    docsBranch: "main",
    series: {
      "/docs/base": [
        {
          text: "Linux",
          children: [
            "/docs/base/linux/part1",
            "/docs/base/linux/part2",
            "/docs/base/linux/part3",
            "/docs/base/linux/part4",
          ],
        },
        {
          text: "Proxy",
          children: [
            "/docs/base/proxy/part1",
          ],
        },
        {
          text: "Git",
          children: [
            "/docs/base/git/part1",
          ],
        },
        {
          text: "Algorithms",
          children: [ "/docs/base/algorithms/part1" ],
        }
      ],
      "/docs/backend": [
        {
          text: "Concurrent",
          children: [
            "/docs/backend/concurrent/part1",
          ],
        },
        {
          text: "DesignPatterns",
          children: [
            "/docs/backend/designPatterns/part1",
            "/docs/backend/designPatterns/part2",
            "/docs/backend/designPatterns/part3",
            "/docs/backend/designPatterns/part4",
          ],
        },
        {
          text: "JVM",
          children: [
            "/docs/backend/jvm/part1",
            "/docs/backend/jvm/part2",
            "/docs/backend/jvm/part3",
          ],
        },
        {
          text: "Kubernetes",
          children: [
            "/docs/backend/kubernetes/part1",
          ],
        },
      ],
      "/docs/bigdata": [
        {
          text: "Hadoop",
          children: [
            "/docs/bigdata/hadoop/part1",
            "/docs/bigdata/hadoop/part2",
            "/docs/bigdata/hadoop/part3",
            "/docs/bigdata/hadoop/part4",
          ],
        },
        {
          text: "Flume",
          children: [
            "/docs/bigdata/flume/part1",
          ],
        },
        {
          text: "Hive",
          children: [
            "/docs/bigdata/hive/part1",
            "/docs/bigdata/hive/part2",
            "/docs/bigdata/hive/part3",
            "/docs/bigdata/hive/part4",
            "/docs/bigdata/hive/part5",
          ],
        },
        {
          text: "HBase",
          children: [
            "/docs/bigdata/hbase/part1",
          ],
        },
        {
          text: "Zookeeper",
          children: [
            "/docs/bigdata/zookeeper/part1",
          ],
        },
        {
          text: "Kafka",
          children: [
            "/docs/bigdata/kafka/part1",
            "/docs/bigdata/kafka/part2",
            "/docs/bigdata/kafka/part3",
          ],
        },
        {
          text: "Spark",
          children: [
            "/docs/bigdata/spark/part1",
            "/docs/bigdata/spark/part2",
          ],
        },
        {
          text: "Flink",
          children: [
            "/docs/bigdata/flink/part1",
            "/docs/bigdata/flink/part2",
            "/docs/bigdata/flink/part3",
          ],
        }
      ],
    },
    navbar: [
      { text: "Home", link: "/" },
    ],
  }),
});
