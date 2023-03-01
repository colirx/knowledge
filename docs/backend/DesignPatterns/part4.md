---
title: 设计模式-04-行为型模式
category:
- backend
tag:
- designPatterns
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

## 观察者模式

观察者模式也叫发布-订阅模式，它可以让多个观察者对象同时监听某一个主题对象，当这个主题对象发生变化时，观察者会收到消息自动更新。

**结构**

- Subject：抽象主题角色，将所有观察者放到一个集合中，每隔主题都可以有任意数量的观察者。抽象主题提供一个接口，可以增加或者删除观察者对象。
- ConcreteSubject：具体主题，将所有有关状态存入具体观察者对象，在具体主题内部改变时，给所有注册过的观察者发送通知。
- Observer：抽象观察者，是观察者的抽象类，定义了一个更新接口，让主题更改时通知自己。
- ConcreteObserver：具体观察者。

**案例**

微信公众号：在使用微信公众号时，当公众号进行了更新之后，关注此公众号的用户都会受到消息。

```java
/**
 * 抽象主题角色类
 */
public interface Subject {

  // 添加订阅者（观察者）
  void attach(Observer observer);

  // 删除订阅者
  void detach(Observer observer);

  // 通知订阅者
  void notify(String message);
}
```

```java
/**
 * 具体主题角色类
 */
public class SubscriptionSubject implements Subject {

  // 定义一个集合，存储多个观察者对象
  private List<Observer> userList = new ArrayList<>();

  @Override
  public void attach(Observer observer) {
    userList.add(observer);
  }

  @Override
  public void detach(Observer observer) {
    userList.remove(observer);
  }

  @Override
  public void notify(String message) {
    userList.forEach(user -> user.update(message));
  }
}
```

```java
/**
 * 抽象观察者类
 */
public interface Observer {

  // 更新
  void update(String message);
}
```

```java
/**
 * 具体观察者
 */
public class ObserverUser implements Observer {

  private String name;

  public ObserverUser(String name) {
    this.name = name;
  }

  @Override
  public void update(String message) {
    System.out.println(String.format("%s - %s", name, message));
  }
}
```

```java
public class Client {
  public static void main(String[] args) {
    // 创建公众号
    SubscriptionSubject subject = new SubscriptionSubject();

    // 订阅公众号
    subject.attach(new ObserverUser("zhangsan"));
    subject.attach(new ObserverUser("lisi"));

    // 公众号更新
    subject.notify("更新");
  }
}
```

**优缺点**

- 优点：降低了耦合，可以实现广播机制。
- 缺点：假如观察者非常多，那么可能会非常耗时。如果被观察者有循环依赖，那么被观察者发送通知会让观察者循环调用，最终系统崩溃。

## 中介者模式

一般来说，人与人之间的关系是十分复杂的，是一种网状结构，但是引入中介者就可以将关系变动为星型关系。

![](./images/2022-01-08-09-11-39.png)

这样就减少了系统的耦合，一个良好的系统不可能在自己的类中维护与其他类之间的关系，而是通过一个中介来进行关系的关联。

**结构**

- 抽象中介者（Mediator）：中介者的接口，提供了对象注册和转发对象信息的抽象方法。
- 具体中介者（Concrete Mediator）：实现中介者接口，定义一个 List 来管理对象，协调各个角色之间的交互关系。
- 抽象对象（Colleague）：定义对象的接口，保存中介者，提供对象交互的抽象方法，实现所有相互影响的对象类的公共功能。
- 具体对象（Concrete Colleague）：抽象类的实现者，当需要与其他对象交互时，中介者负责后续的交互。

**案例**

使用房屋中介来作为案例，房屋中介充当中介者，房租和租房客为对象。


```java
/**
 * 抽象中介类
 */
@SuppressWarnings("unused")
public interface Mediator {

  void constact(String message, Person person);
}
```

```java
/**
 * 抽象对象类
 */
@AllArgsConstructor
public abstract class Person {

  protected String name;
  protected Mediator mediator;
}
```

```java
/**
 * 具体的对象类
 */
public class Tenant extends Person {

  public Tenant(String name, Mediator mediator) {
    super(name, mediator);
  }

  /**
   * 与中介联系的功能
   */
  public void constact(String message) {
    mediator.constact(message, this);
  }

  /**
   * 租房者
   */
  public void getMessage(String message) {
    System.out.println(String.format("租房者 %s 获取到的信息是 %s", name, message));
  }

}
```

```java
/**
 * 具体的对象类
 */
public class HouseOwner extends Person {

  public HouseOwner(String name, Mediator mediator) {
    super(name, mediator);
  }

  /**
   * 与中介联系的功能
   */
  public void constact(String message) {
    mediator.constact(message, this);
  }

  /**
   * 房主
   */
  public void getMessage(String message) {
    System.out.println(String.format("房主 %s 获取到的信息是 %s", name, message));
  }
}
```

```java
/**
 * 具体的中介者
 */
@Data
public class MediatorStructure implements Mediator {

  // 聚合具体的房主和租房者对象
  private HouseOwner houseOwner;
  private Tenant tenant;

  @Override
  public void constact(String message, Person person) {
    if (person == houseOwner) {
      tenant.getMessage(message);
    } else if (person == tenant) {
      houseOwner.getMessage(message);
    }
  }
}
```

```java
public class Client {
  public static void main(String[] args) {
    // 创建中介者
    MediatorStructure mediator = new MediatorStructure();
    // 租客
    Tenant tenant = new Tenant("李四", mediator);
    // 房主
    HouseOwner houseOwner = new HouseOwner("张三", mediator);

    // 中介者要知道具体的房主和租客
    mediator.setTenant(tenant);
    mediator.setHouseOwner(houseOwner);

    // 房客进行沟通
    tenant.constact("房客租房");
    // 房主沟通
    houseOwner.constact("可以");
  }
}
```

**优缺点**

- 优点：松散耦合，集中控制交互，一对多转变为一对一关联。
- 缺点：同事类太多时，中介者的职责会很大，以至于系统难以维护。

**使用场景**

系统中对象存在复杂的引用关系时，当想创建一个运行于多个类之间的对象，但是又不想生成新的子类时。

## 迭代器模式

提供一个对象，来访问聚合对象的一系列数据，而不暴露聚合对象的内部。

**结构**

- 抽象聚合角色（Aggregate）：定义增删查和创建迭代器对象的接口。
- 具体聚合角色（ConcreteAggregate）：实现抽象聚合类，返回一个具体迭代器实例。
- 抽象迭代器（Iterator）：定义访问和遍历聚合元素的接口，通常包含 `hasNext`、`next` 等方法。
- 具体迭代器（ConcreteIterator）：实现抽象迭代器的方法，完成对聚合对象的遍历、并且记录遍历的位置。

**案例**

```java
@Data
@AllArgsConstructor
public class Student {

  private String name;
  private String number;
}
```

```java
/**
 * 抽象迭代器接口
 */
public interface StudentIterator {

  boolean hasNext();

  Student next();
}

/**
 * 具体迭代器角色
 */
public class StudentIteratorImpl implements StudentIterator {

  private List<Student> list;
  private int position = 0;

  public StudentIteratorImpl(List<Student> list) {
    this.list = list;
  }

  @Override
  public boolean hasNext() {
    return position < list.size();
  }

  @Override
  public Student next() {
    Student currentStudent = list.get(position);
    position++;
    return currentStudent;
  }
}
```

```java
/**
 * 聚合对象接口
 */
public interface StudentAggregate {

  void addStudent(Student student);

  void removeStudent(Student student);

  StudentIterator getStudentIterator();
}

/**
 * 具体聚合对象
 */
public class StudentAggregateImpl implements StudentAggregate {

  private List<Student> list = new ArrayList<>();

  @Override
  public void addStudent(Student student) {
    list.add(student);
  }

  @Override
  public void removeStudent(Student student) {
    list.remove(student);
  }

  @Override
  public StudentIterator getStudentIterator() {
    return new StudentIteratorImpl(list);
  }
}
```

```java
public class Client {
  public static void main(String[] args) {
    // 1. 创建聚合对象
    StudentAggregate aggregate = new StudentAggregateImpl();
    // 2. 测试数据
    aggregate.addStudent(new Student("zhangsan","001"));
    aggregate.addStudent(new Student("lisi","002"));
    aggregate.addStudent(new Student("wangwu","003"));
    aggregate.addStudent(new Student("zhaoliu","004"));
    // 3. 获取迭代器
    StudentIterator iterator = aggregate.getStudentIterator();
    while (iterator.hasNext()) {
      System.out.println(iterator.next());
    }
  }
}
```

**优缺点和使用场景**

优点：

- 支持多种遍历方式，迭代方式方便更换。
- 简化了聚合类。
- 引入了抽象层，满足开闭原则。

缺点：

- 增加了类的个数。

使用场景：

- 给聚合对象提供多种遍历方式。

## 访问者模式

封装了一些作用于某种数据结构中的各元素的操作，可以不改变数据结构前提下定义作用于这些新元素的操作。

**结构**

- 抽象访问者（Visitor）：定义了对每一个元素访问的行为，参数是可以访问的元素。
- 具体访问者（ConcreteVisitor）：给出对每一个元素类访问时产生的具体行为。
- 抽象元素（Element）：定义了一个接受访问者的方法（accept），意义是指，每一个元素都要可以被访问者访问。
- 具体元素（ConcreteElement）：提供接受访问方法的的具体实现，而这个具体的实现，通常情况下是使用访问者提供的访问该元素类的方法。
- 对象结构（Object Structure）：定义对象结构，对象结构是一个抽象表述。具体可以理解为一个具有容器性质或者复合对象特征的类，会含有一组元素，并且可以迭代这些元素。

**案例**

```java
/**
 * 抽象访问者角色
 */
public interface Person {

  // 宠物猫喂食
  void feed(Cat cat);

  // 宠物狗喂食
  void feed(Dog dog);
}
```

```java
/**
 * 抽象元素类，接受指定访问者访问的功能
 */
public interface Animal {

  void accept(Person person);
}

/**
 * 具体元素角色类，宠物猫
 */
public class Cat implements Animal {

  @Override
  public void accept(Person person) {
    person.feed(this);
  }
}

/**
 * 具体元素角色类，宠物狗
 */
public class Dog implements Animal {

  @Override
  public void accept(Person person) {
    person.feed(this);
  }
}
```

```java
/**
 * 具体访问者角色类(宠物主)
 */
public class Owner implements Person {

  @Override
  public void feed(Cat cat) {
    System.out.println("喂食猫");
  }

  @Override
  public void feed(Dog dog) {
    System.out.println("喂食狗");
  }
}

/**
 * 具体访问者（其他人）
 */
public class Someone implements Person {

  @Override
  public void feed(Cat cat) {
    System.out.println("其他人喂食猫");
  }

  @Override
  public void feed(Dog dog) {
    System.out.println("其他人喂食狗");
  }
}
```

```java
/**
 * 对象结构类
 */
public class Home {
  // 定义一个集合对象，用来存储元素对象
  List<Animal> nodeList = new ArrayList<>();

  // 添加元素功能
  public void add(Animal animal) {
    nodeList.add(animal);
  }

  // 遍历集合，获取每一个元素，让访问者访问每一个元素
  public void action(Person person) {
    nodeList.forEach(animal -> animal.accept(person));
  }
}
```

```java
public class Client {
  public static void main(String[] args) {
    // 1. 创建 HOME
    Home home = new Home();
    home.add(new Dog());
    home.add(new Cat());

    // 2. 创建宠物主
    Owner owner = new Owner();

    // 3. 主人喂食
    home.action(owner);
  }
}
```

**优缺点和使用场景**

优点：

- 扩展性好。
- 复用性好。
- 分离无关行为。

缺点：

- 对象结构变化困难。
- 违反了依赖导致原则。

使用场景：

- 对象结构相对稳定，但是操作算法经常变更。
- 对象需要提供多种不同且不相关操作，并且要避免让这些操作的变化影响对象的结构。

## 备忘录模式

提供了一种状态恢复机制，使用户可以方便地恢复到一个历史步骤。

**结构**

- 发起人（Originator）：记录当前时刻的内部状态信息，提供创建备忘录和恢复备忘录数据的功能，实现其他业务功能，可以访问备忘录中的所有信息。
- 备忘录（Memento）：存储发起人的内部状态，需要时提供这些内部状态给发起人。
- 管理者（Caretaker）：对备忘录进行管理，提供保存和获取备忘录的功能，但其不能对备忘录内部内容进行访问和修改。

备忘录有两个等效接口：

- 窄接口：管理者和其他发起人之外的任何对象看到的是窄接口，这个窄接口只允许它将备忘录对象传递给其他对象。
- 宽接口：与管理者看到的窄接口相反，这个宽接口允许读取所有数据，以便于恢复发起人对象的内部状态。

**白箱备忘录模式案例**

```java
/**
 * 发起人，游戏角色
 */
@Data
public class GameRole {

  // 生命力
  private int vit;
  // 攻击力
  private int atk;
  // 防御力
  private int def;

  // 初始化状态
  public void initState() {
    this.vit = 100;
    this.atk = 100;
    this.def = 100;
  }

  // 战斗后
  public void fight() {
    this.vit = 0;
    this.atk = 0;
    this.def = 0;
  }

  // 保存角色状态功能
  public RoleStateMemento saveState() {
    return new RoleStateMemento(vit, atk, def);
  }

  // 恢复之前的状态
  public void recoverState(RoleStateMemento roleStateMemento) {
    this.vit = roleStateMemento.getVit();
    this.atk = roleStateMemento.getAtk();
    this.def = roleStateMemento.getDef();
  }

  // 展示状态
  public void display() {
    System.out.println(String.format("角色生命力：%s", vit));
    System.out.println(String.format("角色攻击力：%s", atk));
    System.out.println(String.format("角色防御力：%s", def));
  }
}
```

```java
/**
 * 备忘录角色类
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleStateMemento {

  // 生命力
  private int vit;
  // 攻击力
  private int atk;
  // 防御力
  private int def;
}
```

```java
/**
 * 备忘录管理
 */
@Data
public class RoleStateCaretaker {

  private RoleStateMemento roleStateMemento;
}
```

```java
public class Client {
  public static void main(String[] args) {
    // 1. 创建游戏角色
    GameRole gameRole = new GameRole();
    // 2. 初始化
    gameRole.initState();
    // 3. 展示
    gameRole.display();
    // 4. 备份
    RoleStateCaretaker roleStateCaretaker = new RoleStateCaretaker();
    roleStateCaretaker.setRoleStateMemento(gameRole.saveState());
    // 5. 战斗之后
    gameRole.fight();
    // 6. 展示
    gameRole.display();
    // 7. 恢复之前的状态
    gameRole.recoverState(roleStateCaretaker.getRoleStateMemento());
    // 8. 展示
    gameRole.display();
  }
}
```


**黑箱备忘录案例**

修改内容不多，主要有：

```java
/**
 * 备忘录接口，对外提供窄接口
 */
public interface Memento {
}
```

```java
/**
 * 发起人，游戏角色
 */
@Data
public class GameRole {

  // 生命力
  private int vit;
  // 攻击力
  private int atk;
  // 防御力
  private int def;

  // 初始化状态
  public void initState() {
    this.vit = 100;
    this.atk = 100;
    this.def = 100;
  }

  // 战斗后
  public void fight() {
    this.vit = 0;
    this.atk = 0;
    this.def = 0;
  }

  // 保存角色状态功能
  public RoleStateMemento saveState() {
    return new RoleStateMemento(vit, atk, def);
  }

  // 恢复之前的状态
  public void recoverState(Memento memento) {
    RoleStateMemento roleStateMemento = (RoleStateMemento) memento;
    this.vit = roleStateMemento.getVit();
    this.atk = roleStateMemento.getAtk();
    this.def = roleStateMemento.getDef();
  }

  // 展示状态
  public void display() {
    System.out.println(String.format("角色生命力：%s", vit));
    System.out.println(String.format("角色攻击力：%s", atk));
    System.out.println(String.format("角色防御力：%s", def));
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  class RoleStateMemento implements Memento {

    private int vit;
    private int atk;
    private int def;
  }
}
```

**优缺点和使用场景**

优点：

1. 提供了状态，可以方便的恢复之前的状态。
1. 实现了内部状态的封装。
1. 简化了发起人，发起人不需要保存备份。

缺点：

1. 资源消耗大，假如需要保存的内容较多，则将会占用较大的内存。

使用场景：

1. 需要保存和恢复数据的场景。

## 解释器模式

将需要解决的问题提出规则，抽象为一种语言，比如运算。

**结构**

1. 抽象表达式（Abstract Expression）：定义解释器接口，约定解释器的解释操作，主要包含方法 `interpret`
1. 终结符表达式（Terminal Expression）：是抽象表达式的子类，用来实现和终结符相关的操作。
1. 非终结符表达式（Nonterminal Expression）：抽象表达式的子类。
1. 环境（Context）：包含各个解释器需要的数据或者是公共的功能，一般用于传递被所有解释器共享的数据。
1. 客户端（Client）：将需要分析的句子或者表达式转换为解释器描述的抽象语法树，然后调用解释器的解释方法。

**案例**

```java
/**
 * 抽象表达式类
 */
public abstract class AbstractExpression {
  public abstract int interpret(Context context);
}
```

```java
/**
 * 环境
 */
public class Context {

  // 存储变量和对应的值
  private Map<Variable, Integer> map = new HashMap<>();

  public void assign(Variable variable, Integer value) {
    map.put(variable, value);
  }

  public int getValue(Variable variable) {
    return map.get(variable);
  }
}
```

```java
/**
 * 封装表达式的类
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Variable extends AbstractExpression {

  // 声明存储变量名的成员变量
  private String name;

  @Override
  public int interpret(Context context) {
    // 直接返回变量的值
    return context.getValue(this);
  }
}
```

```java
/**
 * 加法表达式类
 */
@Data
@AllArgsConstructor
public class Plus extends AbstractExpression {

  // 加号左边的表达式
  private AbstractExpression left;
  // 加号右边的表达式
  private AbstractExpression right;

  @Override
  public int interpret(Context context) {
    return left.interpret(context) + right.interpret(context);
  }
}

/**
 * 减法表达式类
 */
@Data
@AllArgsConstructor
public class Minus extends AbstractExpression {

  // 减号左边的表达式
  private AbstractExpression left;
  // 减号右边的表达式
  private AbstractExpression right;

  @Override
  public int interpret(Context context) {
    return left.interpret(context) - right.interpret(context);
  }
}
```

```java
public class Client {
  public static void main(String[] args) {
    // 1. 创建环境对象
    Context context = new Context();
    // 2. 创建变量对象
    Variable a = new Variable("a");
    Variable b = new Variable("b");
    Variable c = new Variable("c");
    Variable d = new Variable("d");
    // 3. 存储
    context.assign(a, 1);
    context.assign(b, 2);
    context.assign(c, 3);
    context.assign(d, 4);
    // 4. 获取抽象语法树
    AbstractExpression expression = new Minus(a, new Plus(new Minus(b, c), d));
    System.out.println(expression.interpret(context));
  }
}
```

**优缺点和使用场景**

优点：

1. 易于改变和扩展文法。
1. 实现文法较为容易。
1. 增加新的解释表达式比较方法。

缺点：

1. 复杂文法难以维护。
1. 执行效率低。

使用场景：

1. 文法较为简单，并且执行效率不是关键问题时。
1. 问题重复出现，并且可以用一种简单的语言表达时。
1. 语言需要解释执行，并且句子可以表示为一个抽象语法树时。
