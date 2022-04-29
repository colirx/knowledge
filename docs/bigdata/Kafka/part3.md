---
title: Kafka-03-组件对接
category:
- bigdata
tag:
- kafka
author: causes
---

## Flume 和 Kafka 对接

### 简单实现

对于 Flume 和 Kafka 来讲，最重要的就是组件之间的对接。Kafka 本身是没有什么组件一说的，最主要的就是 Flume。

Flume 官方提供了 [Kafka Source](https://flume.apache.org/releases/content/1.9.0/FlumeUserGuide.html#kafka-source)、[Kafka Sink](https://flume.apache.org/releases/content/1.9.0/FlumeUserGuide.html#kafka-sink) 以及 [Kafka Channel](https://flume.apache.org/releases/content/1.9.0/FlumeUserGuide.html#kafka-channel)，用于对接。

kafka source，flume 从 kafka 读取数据。那么对于 kafka 来说，kafka source 就是一个消费者的角色。

kafka sink，flume 写到 kafka 中，对于 kafka 来说，kafka sink 是一个生产者的角色。

对于 flume 来说，channel 是一个 source 到 sink 的一个缓存，那么 kafka channel 就是使用 kafka 来做缓。

而且不仅如此，官方其实提供了三种使用场景：

- kafka source -> kafka channel -> kafka sink，全都使用 kafka，就是一种相当可靠的解决方案。
- kafka source -> kafka channel，此场景中没有 sink，但是数据也直接进入到了 kafka 中。
- kafka channel -> kafka sink，此场景中没有 kafka source，但是使用 kafka channel 也可以直接读取数据。

所以 kafka channel 相当于是一个万金油的组件，功能十分强大。

**案例**

```shell
# define
a1.sources = r1
a1.sinks = k1
a1.channels = c1

# source
a1.sources.r1.type = exec
a1.sources.r1.command = tail -F  /opt/module/data/flume.log

# sink
a1.sinks.k1.type = org.apache.flume.sink.kafka.KafkaSink
a1.sinks.k1.kafka.bootstrap.servers = hadoop102:9092,hadoop103:9092,hadoop104:9092
a1.sinks.k1.kafka.topic = first
a1.sinks.k1.kafka.flumeBatchSize = 20
a1.sinks.k1.kafka.producer.acks = 1
a1.sinks.k1.kafka.producer.linger.ms = 1

# channel
a1.channels.c1.type = memory
a1.channels.c1.capacity = 1000
a1.channels.c1.transactionCapacity = 100

# bind
a1.sources.r1.channels = c1
a1.sinks.k1.channel = c1
```

**拦截器案例**

```shell
a1.sources = r1
a1.sinks = k1
a1.channels = c1

a1.sources.r1.type = netcat
a1.sources.r1.bind = 0.0.0.0
a1.sources.r1.port = 6666

a1.sinks.k1.type = org.apache.flume.sink.kafka.KafkaSink
a1.sinks.k1.kafka.topic = third
a1.sinks.k1.kafka.bootstrap.servers = hadoop102:9092,hadoop103:9092,hadoop104:9092
a1.sinks.k1.kafka.flumeBatchSize = 20
a1.sinks.k1.kafka.producer.acks = 1
a1.sinks.k1.kafka.producer.linger.ms = 1

# 注意，这里的拦截器需要配置好，首先将 jar 放到 flume 下的 lib 目录下，之后配置
a1.sources.r1.interceptors = i1
a1.sources.r1.interceptors.i1.type = com.atguigu.kafka.flumeInterceptor.FlumeKafkaInterceptor$MyBuilder

a1.channels.c1.type = memory
a1.channels.c1.capacity = 1000
a1.channels.c1.transactionCapacity = 100

a1.sources.r1.channels = c1
a1.sinks.k1.channel = c1
```

通过拦截器，我们可以实现将分流的操作，也就是按照数据的不同类型分给 kafka 的多个 topic 上。

```java
package com.atguigu.kafka.flumeInterceptor;

import org.apache.flume.Context;
import org.apache.flume.Event;
import org.apache.flume.interceptor.Interceptor;

import javax.swing.text.html.HTMLEditorKit;
import java.util.List;
import java.util.Map;

public class FlumeKafkaInterceptor implements Interceptor {
    @Override
    public void initialize() {

    }

    /**
     * 如果包含"atguigu"的数据，发送到first主题
     * 如果包含"sgg"的数据，发送到second主题
     * 其他的数据发送到third主题
     * @param event
     * @return
     */
    @Override
    public Event intercept(Event event) {
        //1.获取event的header
        Map<String, String> headers = event.getHeaders();
        //2.获取event的body
        String body = new String(event.getBody());
        if(body.contains("atguigu")){
            headers.put("topic","first");
        }else if(body.contains("sgg")){
            headers.put("topic","second");
        }
        return event;

    }

    @Override
    public List<Event> intercept(List<Event> events) {
        for (Event event : events) {
          intercept(event);
        }
        return events;
    }

    @Override
    public void close() {

    }

    public static class MyBuilder implements  Builder{

        @Override
        public Interceptor build() {
            return  new FlumeKafkaInterceptor();
        }

        @Override
        public void configure(Context context) {

        }
    }
}
```
