---
title: Concurrent-01-基础
category:
- backend
tag:
- concurrent
author: causes
---

## 简介

::: tip
需要操作系统和 JVM 的一些基础知识，否则可能会看的很吃力。
参考书籍 《Java 并发编程实战》
:::

现代计算机支持多个进程（每个进程中包含至少一个线程），操作系统分配资源是以进程为单位，但是分配 CPU 是以线程为单位的，所以 CPU 也叫做轻量级处理器。

线程在一个系统中有着巨大的优势，例如可以保证多任务的并发执行，充分发挥多处理器的性能，但是线程实质上是一把双刃剑，它在带来便利的同时同样存在着风险。

**安全性问题**

```java
// 线程不安全
class Unsafe {
  private int value;

  public int getNext() {
    return value++;
  }
}
```

表面上看起来这个类是一个返回 `value++` 的操作，但其实它包含了以下三个步骤：

1. 读取 value 的值。
1. value + 1
1. 写 value 的值。

在 Java 中，多个线程虽然有自己独立的栈空间，但是堆空间是进程中的线程共享的，所以在多线程模式下很有可能会获取相同的值，这是非常危险的。

**活跃性问题**

简单来讲，活跃性问题就是后面的操作无法继续执行，在单线程模式下最常见的活跃性问题是无限循环。而在多线程模式下则更多（例如死锁、饥饿、活锁）。

**性能问题**

事实上多线程往往会带来性能问题，CPU 在挂起一个活跃线程而转而运行另一个线程时，就会频繁出现上下文切换操作，这种情况会带来更多的运行时开销，并且 CPU 的时间花费在线程调度的时间上更多了，也就意味着在线程运行上花费的时间更少了。

## 线程安全性

在构建稳定的并发程序时，我们经常会使用到线程和锁，但是这些终究是一种机制，要编写线程安全的代码，最终还是要对**共享（Shared）、可变（Mutable）**的状态进行管理。

假如某个变量属于线程私有的，那么无论我们怎么去改变，也不会产生并发问题，我们真正需要注意的是那些可以被多个线程共享的，并且是可变的变量。

```java
public class Demo {
  public static void main(String[] args) {
    SafeCount safeCount = new SafeCount();

    new Thread(safeCount).start();
    new Thread(safeCount).start();
  }
}

class SafeCount implements Runnable {
  @Override
  public void run() {
    int count = 10;
    try {
      Thread.sleep(1000);
      while (count > 0) {
        count--;
        System.out.printf("%s --> %s\n", Thread.currentThread().getName(), count);
      }
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }
}
```

这个例子中，count 属于线程私有变量，无论执行多少次，我们都不需要担心同步问题。

```java
class SafeCount implements Runnable {
  final Integer count = 10;

  @Override
  public void run() {
    try {
      Thread.sleep(1000);
      System.out.printf("%s --> %s\n", Thread.currentThread().getName(), count);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }
}
```

虽然 count 可以被多个线程共享，但是没有修改的情况，这也是线程安全的。

```java
public class Demo {
  public static void main(String[] args) {
    UnSafeCount unSafeCount = new UnSafeCount();

    new Thread(unSafeCount).start();
    new Thread(unSafeCount).start();
  }
}

class UnSafeCount implements Runnable {
  int count = 10;

  @Override
  public void run() {
    try {
      Thread.sleep(1000);
      while (count > 0) {
        count--;
        System.out.printf("%s --> %s\n", Thread.currentThread().getName(), count);
      }
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }
}
```

这个类变得不再安全，这是因为线程私有的 count 已经被多个线程共享，并且可以随时修改。

其实本质上来说，这个类在多线程下不安全的原因是 `count--` 这个操作并非是原子性操作，表面上看 `count--` 虽然只有一步，但是它其实包含了三个步骤：

- 读取 count 的值。
- 将值减少 1。
- 写入 count 的值。

在并发状态下，很有可能有 A、B 两个线程同时读取到 count 的值（这个时候 count 是相同的，例如是 9），那么它们就会同时执行后面的两步操作，导致 count 本来应当减少两次变成了减少一次。两个线程拿到的值也是相同的。

对于不恰当的执行顺序导致的并发安全性问题，我们有一个专业术语：竞态条件。

最常见的竞态条件就是：先检查后执行。也就是上面的例子，上面的例子首先会检查 count 的值，之后根据检查的返回结果做下一步的处理。

另一个先检查后执行的例子是懒汉式单例模式，如果不加同步机制，懒汉式单例在多线程状态下是线程不安全的。

```java
public class Singleton {
  private Singleton() {
  }

  private static Singleton instance;

  public static Singleton getInstance() {
    if (instance != null) {
      instance = new Singleton();
    }
    return instance;
  }
}
```

所以这种复合操作必须为原子操作才可以避免竞态条件，注意，即使使用 `AtomicInteger` 也不能完全避免，因为 `AtomicInteger` 保护的只有它自己那一部分为原子操作，而不是整个方法为原子操作。最好的办法就是加锁。

**重入**

加锁其实是对一个线程加锁，而不是对一个操作加锁，举个例子：

```java
class SafeCount implements Runnable {
  @Override
  public synchronized void run() {
    ...
  }
}

class SafeChild extends SafeCount {
  @Override
  public void run() {
    ...
    super.run();
  }
}
```

在这个例子中，假如 `synchronized` 保护的只有 `SafeCount` 中的 run，那么子类去调用父类的操作时是获取不到的，所以加锁保护的是这一整个线程，而不是仅仅某一个方法，这个概念叫做锁的重入。

**活跃性和性能问题**

尽管锁十分方便，但是不要依赖使用，锁在带来并发安全的同时也带来的是性能问题。要分清楚什么时候需要锁控制并发，什么时候不需要。尤其是对于耗时比较长的操作（网络、I/O）一定不要持有锁。
