---
title: 设计模式-行为型模式
categories:
  - backend
tags:
  - DesignPatterns
author: causes
---

## 行为型模式

行为型模式分为类行为型模式（使用继承方式）和对象行为型模式（使用组合/聚合方式）。

行为型模式分为：

- 模板方法模式。
- 策略模式。
- 命令模式。
- 职责链（责任链）模式。
- 状态模式。
- 观察者模式。
- 中介者模式。
- 迭代器模式。
- 访问者模式。
- 备忘录模式。
- 解释器模式。

以上的模式除了模板方法和解释器模式属于类行为型模式，其余都是对象行为型模式。

## 模板方法模式

去银行办理业务有四个步骤：取号 -> 排队 -> 办理业务 -> 对工作人员评分。

其中取号、排队、对工作人员评分这三个步骤对每个人是一样的，但是办理的业务是不一样的。所以办理业务可以为一个抽象，其他的均为具体实现。

并且这四个步骤的先后顺序是一样的，所以步骤执行也可以放到父类中去实现。

那么这就是模板方法模式，首先定义一个算法的具体骨架，并将一些步骤延迟到子类中去实现，让子类可以不改变算法结构的情况下重新定义算法的某些特定步骤。

**结构**

模板方法（Template Method）模式包含以下角色：

- 抽象类（Abstract Class）：负责给出一个算法的骨架。
    - 模板方法：定义了算法的骨架，按照某种顺序调用其包含的基本方法。
    - 基本方法：实现算法各个步骤的具体方法：
        - 抽象方法（Abstract Method）：一个抽象方法的声明，具体子类来实现。
        - 具体方法（Concrete Method）：一个具体方法，实现抽象方法，也可以覆盖父类的实现。
        - 钩子方法（Hook Method）：在抽象类中已经实现，包括用于判断的逻辑方法和需要子类重写的空方法两种。一般使用 `isxxx` 来命名。
- 具体子类：实现抽象类中定义的抽象方法和钩子方法，是一个顶级逻辑的组成步骤。


**案例**

用模板方法模式来模拟炒菜的工作，炒菜步骤：倒油 -> 热油 -> 倒蔬菜 -> 倒调料品 -> 翻炒。

基本方法分为：倒油、热油、倒蔬菜、倒调料品、翻炒。
基本方法中的抽象方法有：倒蔬菜、倒调料品。

```java
/**
 * 抽象类，定义模板方法和基本方法
 */
public abstract class AbstractClass {

  // 模板方法，定义算法骨架，子类不可以改变方法的骨架，所以使用 final 修饰
  public final void cookProcess() {
    pourOil();
    heatOil();
    pourVegetable();
    pourSauce();
    fry();
  }

  // 倒油
  public void pourOil() {
    System.out.println("倒油");
  }

  // 热油
  public void heatOil() {
    System.out.println("热油");
  }

  // 倒蔬菜，蔬菜是不一样的，所以它属于模板方法
  public abstract void pourVegetable();

  // 倒调料品，调料品也不同
  public abstract void pourSauce();

  // 翻炒
  public void fry() {
    System.out.println("翻炒");
  }

}
```

```java
/**
 * 炒包菜类
 */
public class ConcreteClassBaocai extends AbstractClass{
  @Override
  public void pourVegetable() {
    System.out.println("包菜");
  }

  @Override
  public void pourSauce() {
    System.out.println("辣椒");
  }
}

/**
 * 炒菜心
 */
public class ConcreteClassCaixin extends AbstractClass{
  @Override
  public void pourVegetable() {
    System.out.println("菜心");
  }

  @Override
  public void pourSauce() {
    System.out.println("蒜蓉");
  }
}
```

```java
public class Client {
  public static void main(String[] args) {
    ConcreteClassBaocai baocai = new ConcreteClassBaocai();
    baocai.cookProcess();
  }
}
```

**优缺点**

优点：

- 提高代码复用性。
- 实现了反向控制（父类调用子类的操作）。

缺点：

- 对每一个不同的实现都需要定义一个子类，这会导致类的个数增加（但是不会爆炸增加，还好），系统更加庞大，设计也更加抽象。
- 父类中的抽象方法由子类实现，子类会影响父类的结果，导致了反向控制。优点是反向控制，缺点也是反向控制。

## 策略模式

策略模式定义了一系列的算法，这些算法可以相互替换，并且替换的变化不会影响到使用这些算法的用户。策略模式属于对象行为模式。

**结构**

策略模式主要角色如下：

- 抽象策略（Strategy）类：抽象角色，通常是接口或者抽象类。
- 具体策略（Concrete Strategy）类：实现了抽象策略类，提供了具体的算法实现。
- 环境（Context）类：持有策略类的引用，最终给客户端调用。

**案例**

百货公司做促销活动，针对不同节日推出不同的促销活动。

```java
/**
 * 抽象策略类
 */
public interface Strategy {
  public abstract void show();
}
```

```java
/**
 * 具体策略类，促销活动 A
 */
public class StrategyA implements Strategy {
  @Override
  public void show() {
    System.out.println("买一送一");
  }
}

/**
 * 具体策略类，促销活动 B
 */
public class StrategyB implements Strategy {
  @Override
  public void show() {
    System.out.println("满两百减五十");
  }
}

/**
 * 具体策略类，促销活动 C
 */
public class StrategyC implements Strategy {
  @Override
  public void show() {
    System.out.println("换购");
  }
}
```

```java
/**
 * 环境类，促销员
 */
public class SalesMan {
  private Strategy strategy;

  public SalesMan(Strategy strategy) {
    this.strategy = strategy;
  }

  public void salesManShow() {
    strategy.show();
  }
}
```

```java
public class Client {
  public static void main(String[] args) {
    SalesMan salesMan = new SalesMan(new StrategyA());
    salesMan.salesManShow();
  }
}
```

**优缺点和使用场景**

优点：

- 策略类之间可以互相切换。
- 易于扩展，符合开闭原则。
- 避免使用多重条件（if else）。

缺点：

- 客户端必须知道所有的策略类并且自行选择。
- 会造成产生很多策略类，可以通过享元模式在一定程度上减少对象数量。

使用场景：

- 一个系统需要动态地在几种算法中选择一种时。
- 各个算法相互独立，对客户隐藏具体的细节。
- 系统中大量的 if else 时。
- 多个类只是在表现行为不同时，在运行时动态选择具体要执行的行为。

## 命令模式

命令模式将**请求**封装为了一个对象，让发出请求的责任和执行请求的责任分隔开。这样两者之间通过命令对象进行沟通，方便命令的管理。

**结构**

命令模式包含以下角色：

- 抽象命令（Command）角色：定义命令的接口，声明执行的方法。
- 具体命令（Concrete Command）角色：具体的命令。通常会持有接收者，并且调用接收者的功能来完成命令操作。
- 实现者/接受者（Receiver）角色：接收者，真正执行命令的对象。
- 调用者/请求者（Invoker）角色：要求命令对象执行请求，通常会持有命令对象。

**案例**

日常生活中，点餐有如下场景：客户下单给服务员 --> 服务员拿到订单交给厨师 --> 厨师准备餐点，在这种场景下，女招待和厨师高度耦合，餐厅规模一大就不好沟通。

我们使用命令模式解决问题：

- 服务员：调用者，发起命令。
- 厨师：接收者，执行命令。
- 订单类。
- 抽象命令类。
- 命令类：命令类包含订单类。

```java
/**
 * 订单类
 */
@Data
public class Order {

  // 餐桌号码
  private Integer diningTable;

  // 餐品和份数
  private Map<String, Integer> foodDir = new HashMap<>();

  public void setFoodDir(String name, Integer num) {
    foodDir.put(name, num);
  }
}
```

```java
/**
 * 实现者，厨师类
 */
public class SeniorChef {

  public void makeFood(String name, Integer num) {
    System.out.printf("%s 份 %s\n", name, num);
  }
}
```

```java
/**
 * 抽象命令类
 */
public interface Command {

  void execute();
}

/**
 * 具体命令类
 */
@AllArgsConstructor
public class OrderCommand implements Command {

  // 具体命令类要持有接收者
  private SeniorChef receiver;

  // 具体命令类要持有订单
  private Order order;

  @Override
  public void execute() {
    System.out.printf("%s 桌的订单：\n", order.getDiningTable());
    Map<String, Integer> foodDir = order.getFoodDir();
    foodDir.keySet().forEach(foodName -> receiver.makeFood(foodName, foodDir.get(foodName)));
    System.out.printf("%s 桌的饭准备完毕\n", order.getDiningTable());
  }
}
```

```java
/**
 * 请求者，服务员类
 */
public class Waitor {

  // 可以持有多个命令对象
  private List<Command> commands = new ArrayList<>();

  public void setCommand(Command command) {
    commands.add(command);
  }

  // 发起命令
  public void orderUp() {
    System.out.println("订单来了");
    commands.forEach(command -> {
      if (Objects.isNull(command)) {
        return;
      }
      command.execute();
    });
  }
}
```

```java
public class Client {
  public static void main(String[] args) {
    // 创建两个订单
    Order order1 = new Order();
    order1.setDiningTable(1);
    order1.setFoodDir("西红柿鸡蛋面", 1);
    order1.setFoodDir("小杯可乐", 2);

    Order order2 = new Order();
    order2.setDiningTable(2);
    order2.setFoodDir("尖椒肉丝盖饭", 1);
    order2.setFoodDir("小杯雪碧", 1);

    // 创建接收者，厨师对象
    SeniorChef receiver = new SeniorChef();

    // 创建命令对象
    OrderCommand command1 = new OrderCommand(receiver, order1);
    OrderCommand command2 = new OrderCommand(receiver, order2);

    // 创建调用者
    Waitor invoke = new Waitor();
    invoke.setCommand(command1);
    invoke.setCommand(command2);

    // 服务员发起命令
    invoke.orderUp();
  }
}
```

**优缺点和使用场景**

优点：

- 降低系统耦合度。
- 增加或者删除命令十分方便，满足开闭原则，对扩展比较灵活。
- 可以和组合模式结合，将多个命令装配成一个组合命令，也就是宏命令。
- 方便实现命令的撤销和恢复，也就是 Undo 和 Redo 的操作。

缺点：

- 系统可能会有很多具体命令类。
- 结构更加复杂。

使用场景：

- 系统需要将调用者和请求者进行解耦。
- 系统需要在不同时间指定请求，将请求排队和执行请求。
- 需要支持命令的撤销和恢复操作。

## 职责链（责任链）模式

员工在买器材进行报销的时候，每个领导能够批准的额度不同，员工必须去根据自己的实际情况找不同的领导，这就增加了难度。

责任链模式解决了这个问题，它将所有的请求处理连成了一条线，当上一个处理者处理不了这个问题，就会扔给下一个，直到有对象处理它为止。

责任链模式包含以下角色：

- 抽象处理者（Handler）：定义一个处理请求的接口，包含抽象处理方法和一个后继链接。
- 具体处理者（Concrete Handler）：实现抽象处理者的处理方法，判断能否处理本次请求，可以处理则处理，否则转给后继者。

**案例**

```java
/**
 * 请假条
 */
@Data
@AllArgsConstructor
public class LeaveRequest {

  // 姓名
  private String name;
  // 请假的天数
  private Integer num;
  // 理由
  private String content;
}
```

```java
/**
 * 抽象处理者
 */
@Data
public abstract class Handler {
  // 请假天数
  protected static final Integer NUM_ONE = 1;
  protected static final Integer NUM_THREE = 3;
  protected static final Integer NUM_SEVEN = 7;

  // 该领导可以处理的请假天数区间
  private Integer numStart;
  private Integer numEnd;

  // 后继者
  private Handler nextHandler;

  public Handler(Integer numStart) {
    this.numStart = numStart;
  }

  public Handler(Integer numStart, Integer numEnd) {
    this.numStart = numStart;
    this.numEnd = numEnd;
  }

  // 各级领导处理请假条的方法
  protected abstract void handleLeave(LeaveRequest leaveRequest);

  // 提交请假条
  public final void submit(LeaveRequest leave) {
    // 领导进行审批
    this.handleLeave(leave);
    // 假设有上级领导，并且请假天数超过了自己的权限，则交给上级领导，否则流程结束
    if (Objects.nonNull(this.nextHandler) && leave.getNum() > this.numEnd) {
      this.nextHandler.submit(leave);
    } else {
      System.out.println("流程结束");
    }
  }
}
```

```java
/**
 * 小组长类
 */
public class GroupLeader extends Handler {
  public GroupLeader() {
    // 小组长只有 0 - 1 天的请假权限
    super(0, Handler.NUM_ONE);
  }

  @Override
  protected void handleLeave(LeaveRequest request) {
    System.out.printf("%s 请假 %s 天，%s。\n小组长审批：同意\n", request.getName(), request.getNum(), request.getContent());
  }
}

/**
 * 部门经理
 */
public class Manager extends Handler{
  public Manager() {
    // 部门经理可以处理 3 - 7 天的请假内容
    super(Handler.NUM_ONE, Handler.NUM_THREE);
  }

  @Override
  protected void handleLeave(LeaveRequest request) {
    System.out.printf("%s 请假 %s 天，%s。\n经理审批：同意\n", request.getName(), request.getNum(), request.getContent());
  }
}

/**
 * 总经理
 */
public class GeneralManager extends Handler {


  public GeneralManager() {
    super(NUM_THREE, NUM_SEVEN);
  }

  @Override
  protected void handleLeave(LeaveRequest request) {
    System.out.printf("%s 请假 %s 天，%s。\n总经理审批：同意\n", request.getName(), request.getNum(), request.getContent());
  }
}
```

```java
public class Client {
  public static void main(String[] args) {
    LeaveRequest request = new LeaveRequest("小明", 1, "身体不适");

    // 创建各级领导对象
    GroupLeader groupLeader = new GroupLeader();
    Manager manager = new Manager();
    GeneralManager generalManager = new GeneralManager();

    // 设置处理者链
    groupLeader.setNextHandler(manager);
    manager.setNextHandler(generalManager);

    // 提交请假条
    groupLeader.submit(request);
  }
}
```

**优缺点**

优点：

- 降低了请求发送者和接收者之间的耦合度。
- 可以根据需要增加新的请求处理类，满足开闭原则。
- 当工作流程发送变化，可以动态改变次序，增加了灵活性。
- 责任链简化了对象之间的链接，只需要一个指向后继的引用即可。
- 每个类只需要处理自己该处理的工作，不能处理的传递给下一个对象。

缺点：

- 不能保证每一个请求一定被处理，可能传递倒链的末端都得不到处理。
- 对于比较长的责任链，系统性能可能会受到一定影响。
- 责任链如果设置错误（比如成环）会导致系统出错。


## 状态模式

例如：

现在有一个电梯，电梯有这样几种状态：打开、关闭、运行、停止。电梯的运行和这几种状态有关，如果使用普通的做法，我们可以使用枚举类或者几个静态常量来进行判断，进而编写程序。

但是这种写法太过复杂，状态模式就是为了解决这种问题而出现的，也就是将状态提取到状态对象中，允许状态对象在其内部状态发生改变时改变其行为。

**结构**

状态模式包含以下主要角色：

- 环境（Context）角色：也叫做上下文，定义了客户程序需要的接口，维护一个当前状态，并且将状态有关的操作都委托给当前状态对象处理。
- 抽象（State）角色：定义一个接口，用以封装环境对象中的特定状态所对应的行为。
- 具体状态（Concrete State）角色：实现抽象状态所对应的行为。

**案例**

对上面的电梯例子进行改进：

首先来判断：

- 当电梯门关上时：可以打开电梯门（电梯在静止状态下），可以运行电梯（电梯在静止状态下），可以停止电梯（电梯在运行状态下）。
- 当电梯停止时：可以打开电梯门（当电梯门关上时），可以关上电梯门（电梯门开启时），可以运行电梯（电梯门关上时）。
- 当电梯正在运行时：可以停止电梯。

那么我们可以得到几种基本动作：

- 打开电梯门。
- 关闭电梯门。
- 启动电梯。
- 停止电梯。

```java
/**
 * 抽象状态类
 */
@Data
public abstract class LiftState {

  // 环境角色类对象
  protected Context context;

  // 电梯门开启操作
  public abstract void open();

  // 电梯门关闭操作
  public abstract void close();

  // 电梯运行操作
  public abstract void run();

  // 电梯停止操作
  public abstract void stop();
}
```

那么对应这几种操作，电梯有几种状态，而这几种状态可以执行的操作是不同的：

```java
/**
 * 设置当前状态对象
 */
@Data
public class Context {

  public final static OpeningState OPENING_STATE = new OpeningState();
  public final static ClosingState CLOSING_STATE = new ClosingState();
  public final static RunningState RUNNING_STATE = new RunningState();
  public final static StopingState STOPING_STATE = new StopingState();

  private LiftState liftState;

  public void setLiftState(LiftState liftState) {
    this.liftState = liftState;
    // 设置当前状态 context 对象
    this.liftState.setContext(this);
  }

  public void open() {
    this.liftState.open();
  }

  public void close() {
    this.liftState.close();
  }

  public void run() {
    this.liftState.run();
  }

  public void stop() {
    this.liftState.stop();
  }
}
```

```java
/**
 * 电梯门开启状态
 */
public class OpeningState extends LiftState {
  @Override
  public void open() {
    System.out.println("电梯开启……");
  }

  @Override
  public void close() {
    super.context.setLiftState(Context.CLOSING_STATE);
    super.context.close();
  }

  // 电梯门在开启的状态肯定不可以运行
  @Override
  public void run() {

  }

  // 电梯门在开启的状态下本身就是停止运行状态
  @Override
  public void stop() {

  }
}

/**
 * 电梯门关闭状态
 */
public class ClosingState extends LiftState{
  // 电梯门关闭之后再打开也是允许的操作
  @Override
  public void open() {
    super.context.setLiftState(Context.OPENING_STATE);
    super.context.open();
  }

  @Override
  public void close() {
    System.out.println("电梯门关闭……");
  }

  // 电梯门关闭之后开始运行是允许的
  @Override
  public void run() {
    super.context.setLiftState(Context.RUNNING_STATE);
    super.context.run();
  }

  // 电梯门关上之后就停止也是可以发生的
  @Override
  public void stop() {
    super.context.setLiftState(Context.STOPING_STATE);
    super.context.stop();
  }
}

/**
 * 电梯运行状态
 */
public class RunningState extends LiftState{
  // 电梯在运行状态肯定不可以开门
  @Override
  public void open() {

  }

  // 电梯在运行之前肯定已经关门了，所以 RUNNING 状态无需执行
  @Override
  public void close() {

  }

  @Override
  public void run() {
    System.out.println("电梯正在运行……");
  }

  // 电梯运行完之后肯定是可以停止了，所以停止操作也可以做
  @Override
  public void stop() {
    super.context.setLiftState(Context.STOPING_STATE);
    super.context.stop();
  }
}

/**
 * 电梯停止状态
 */
public class StopingState extends LiftState{
  // 电梯停止状态肯定是可以开门的
  @Override
  public void open() {
    super.context.setLiftState(Context.OPENING_STATE);
    super.context.open();
  }

  // 电梯停止之前肯定执行的是关门的操作，所以这个关门不需要
  @Override
  public void close() {
  }

  // 停止之后可以运行
  @Override
  public void run() {
    super.context.setLiftState(Context.RUNNING_STATE);
    super.context.run();
  }

  @Override
  public void stop() {
    System.out.println("电梯停止……");
  }
}
```

最后使用一个客户端来实现效果：

```java
public class Client {
  public static void main(String[] args) {
    Context context = new Context();
    // 首先给一个电梯的状态
    context.setLiftState(new RunningState());

    // 分别尝试运行以下电梯的各种状态方法，发现只有运行和停止被执行了，这就说明针对某种状态有不同的操作
    context.open();
    context.close();
    context.run();
    context.stop();
  }
}
```

以上的几个类（尤其对于 `Context` 和 `xxxState` 来说）混合在一起，相互依赖，不是很好分辨。看起来虽然比较麻烦，但其实内在逻辑是很清晰的。

建议实在看不懂就把代码复制下来，在 IDEA 里面慢慢看一看，点一点就懂了。

**优缺点**

优点：

- 将某个状态有关的行为放到一个类中，并且可以很方便的增加新的状态，只需要改变状态即可改变行为。
- 允许状态转换和状态行为合成一体，而不是一个巨大的语句块。

缺点：

- 增加系统类和对象的个数。
- 状态模式比较复杂，使用不当会导致程序混乱。
- 对开闭原则支持不太好。
