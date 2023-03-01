---
title: Hive-04-DQL
category:
- bigdata
tag:
- hive
author: causes
---


## 基础查询

Hive 这款工具是基于 Hadoop，面向数据进行分析的工具，因此 SELECT 是十分重要的内容。


**数据准备**

```sql
-- 1. 准备表，我们使用 2021 美国新冠确诊病例和死亡人数作为案例
DROP TABLE IF EXISTS t_usa_covid19;
CREATE TABLE t_usa_covid19 (
    count_date string,
    county  string,
    state string,
    fips int,
    cases int,
    deaths int
) ROW FORMAT DELIMITED FIELDS TERMINATED BY ",";

/*
    数据大致类似如此：

    2021-01-28,Oglala Lakota,South Dakota,46102,2036,42
    2021-01-28,Pennington,South Dakota,46103,12310,167
    2021-01-28,Perkins,South Dakota,46105,333,11
    2021-01-28,Potter,South Dakota,46107,343,3
    2021-01-28,Roberts,South Dakota,46109,1105,34
    2021-01-28,Sanborn,South Dakota,46111,323,3
    2021-01-28,Spink,South Dakota,46115,760,25
*/

LOAD DATA LOCAL INPATH "/tmp/hivedata/us-covid19-counties.dat" INTO TABLE t_usa_covid19;

-- 2. 创建一张分区表，目的是基于 count_data（日期），state（州）进行分区
CREATE TABLE t_usa_covid19_p (
    county string,
    fips int,
    cases int,
    deaths int
) PARTITIONED BY (count_date string, state string) ROW FORMAT DELIMITED FIELDS TERMINATED BY ",";

-- 3. 基于动态分区将数据插入
SET hive.exec.dynamic.partition.mode = nonstrict;
INSERT INTO TABLE t_usa_covid19_p PARTITION (count_date, state)
SELECT county, fips, cases, deaths, count_date, state FROM t_usa_covid19;
```


**基础案例**

```sql
--------------------------------------------- 基础查询 ---------------------------------------------
-- 1. select_expr，它表示需要检索的列，使用 * 或者列举字段，还可以使用正则表达式来匹配字段
SELECT * FROM t_usa_covid19_p;
SELECT county FROM t_usa_covid19_p;
-- 开启正则表达式，带反引号的名称会被解释为正则
SET hive.support.quoted.identifiers = none;
SELECT `^c.*` FROM t_usa_covid19_p;
-- 查询当前数据库，这里省去了 FROM 关键字
SELECT current_database();
SELECT count(county) FROM t_usa_covid19_p;

-- 2. ALL、DISTINCT，指定是否应该返回重复的行，默认是 ALL（返回），可以指定 DISTINCT（不返回）
SELECT state FROM t_usa_covid19_p;
SELECT DISTINCT state FROM t_usa_covid19_p;

-- 3. WHERE，支持子查询，可以使用一般函数，但是不能使用聚合函数（例如 sum()）
-- 使用聚合函数的前提是结果已经确定，但是在 WHERE 子句中，结果集仍然处于未确定的状态
SELECT * FROM t_usa_covid19_p WHERE state = "California" AND deaths > 1000;

-- 4. 分区查询、分区裁剪
-- 分区裁剪的意思是，对分区表进行查询时，只访问符合条件的分区，这样就可以大大提高效率，节省资源。同样的道理，也有一个列裁剪的概念。
SELECT * FROM t_usa_covid19_p WHERE state = "California" AND deaths > 1000;

-- 5. GROUP BY，用于聚合函数，根据一个或者多个列对结果集进行分组
SELECT state, count(deaths) FROM t_usa_covid19_p WHERE count_date = "2021-01-28" GROUP BY state;

-- 6. HAVING，HAVING 同样用来进行过滤，和 WHERE 不同的是，HAVING 子句发生在结果集已经确定之后，所以可以和聚合函数一起使用了
SELECT state, sum(deaths)
FROM t_usa_covid19_p
WHERE count_date = "2021-01-28"
GROUP BY state
HAVING sum(deaths) > 10000;
-- 这种写法更好，HAVING 就无需再算一次了
SELECT state, sum(deaths) AS count
FROM t_usa_covid19_p
WHERE count_date = "2021-01-28"
GROUP BY state
HAVING count > 10000;

-- 7. LIMIT
SELECT state, sum(deaths) AS count
FROM t_usa_covid19_p
WHERE count_date = "2021-01-28"
GROUP BY state
HAVING count > 10000
LIMIT 5;
```

::: tip

语句执行顺序：FROM -> WHERE -> GROUP -> HAVING -> ORDER -> SELECT

:::

假如发生 OOM，在 `yarn-site.xml` 增加可用内存，比如：

```xml
<property>
    <name>yarn.scheduler.maximum-allocation-mb</name>
    <value>2048</value>
</property>
<property>
    <name>yarn.scheduler.minimum-allocation-mb</name>
    <value>2048</value>
</property>
<property>
    <name>yarn.nodemanager.vmem-pmem-ratio</name>
    <value>2.1</value>
</property>
<property>
    <name>mapred.child.java.opts</name>
    <value>-Xmx1024m</value>
</property>
```

## 高阶查询

**ORDER BY**

Hive 中的 `ORDER BY` 和 SQL 中类似，它会对输出的结果进行全局排序，因此底层使用 MapReduce 时仅会使用一个 reduce task 来执行。但正因为如此，排序的时间也很长，并且要注意内存问题。

```sql
-- 排序默认使用 ASC 升序，可以指定为 DESC 降序。
-- 在 Hive 2.1.0 和更高版本中，支持在 ORDER BY 子句中为每个列指定 null 类型结果排序顺序。ASC 默认 null 为首位，而 DESC 为末位。
SELECT * FROM t_usa_covid19_p WHERE count_date = "2021-01-28" AND state = "California" ORDER BY deaths;
```

强烈建议，将 LIMIT 与 ORDER BY 结合使用，避免数据集行数过大。而且当 `hive.mapred.mode` 为 `strict` 严格模式时，必须带 `LIMIT`。

**CLUSTER BY**

Hive 中的 `CLUSTER BY` 语法是分区排序，简单来说就是将数据首先根据指定的字段进行分区，然后分区间根据这个字段进行正排序（不允许自定排序规则）。

分区的规则基于哈希散列，`hash_func(col_name) % reduce task nums`，所以可以看到，分为几组取决于 reduce task 的个数。

```sql
-- 手动设置 reduce task 的个数
SET mapreduce.job.reduces = 2;
-- 指定 sno 为分区排序的字段，分区的个数将会为两个
SELECT * FROM student CLUSTER BY sno;
```

**DISTRIBUTE BY + SORT BY**

`CLUSTER BY` 虽然可以进行分区排序，但其实功能还不够强大。假如我们想要将学生表根据性别分为两个部分，然后根据年龄排序，那么 `CLUSTER BY` 是肯定做不到的。

我们也不能使用 `ORDER BY`，因为一旦使用就是全局排序，会强制设置 reduce task 的个数为 1，这样无法满足分区的需求。

此时我们可以使用 `DISTRIBUTE BY + SORT BY` 来替换，`DISTRIBUTE BY` 负责分区，`SORT BY` 负责排序，并且分区和排序可以为不同字段。

```sql
-- DISTRIBUTE BY 会根据 sex 进行分区，而 SORT BY 会在分区之后，根据 sage 进行倒序排序
SELECT * FROM student DISTRIBUTE BY sex SORT BY sage DESC;
```

这样看来，其实 `CLUSTER BY` 是一个简略版，更加复杂的功能推荐使用 `DISTRIBUTE BY + SORT BY`。

**UNION**

和 SQL 的用法相同，`UNION` 的作用就是可以将多个 `SELECT` 语句的结果合并为一个结果集，可以使用 `UNION、UNION ALL、UNION DISTINCT`，但是注意：

- 使用 `UNION` 等同于使用 `UNION DISTINCT`，它会默认去除重复行。使用 `UNION ALL` 则不会去除重复行。`1.2.0` 之前的 Hive 版本仅支持 `UNION ALL`。
- 使用 `UNION` 关键字时，每个 `SELECT` 语句查询的列的数量和名称必须相同。

**子查询**

Hive 现在可以支持嵌套级别的子查询，可以使用关键词 `AS` 来指定子查询的名称。并且可以支持跟在 `FROM` 和 `WHERE` 两个关键词后的子查询。

```sql
-- 跟在 FROM 后的子查询
SELECT num
FROM (
    SELECT num, name FROM student_local
    UNION
    SELECT num, name FROM student_hdfs
) tmp;

-- 跟在 WHERE 后的子查询
-- 不相关子查询，就是说这样的子查询相当于 IN、NOT IN。
SELECT *
FROM student_hdfs
WHERE student_hdfs.num IN (
    SELECT num FROM student_local LIMIT 2
);
-- 相关子查询，就是说相当于判断 boolean，使用 EXISTS 和 NOT EXISTS 来查询。而且这种情况下，子句中支持对父查询的引用，比如下面就使用了 t1。
SELECT a
FROM t1
WHERE EXISTS (
    SELECT b FROM t2 WHERE t1.x = t2.y
);
```

**CTE**

CTE（Common Table Expressions），公用表表达式，它是一种临时的结果集，会放到内存中。它派生于 WITH 子句，这种公用表达式的出现主要是为了改善效率。

简单来说，只要短句中所定义的表名被用到两次以上，那么优化器会自动将获取的数据放到一个临时表中，这就叫做 CTE。需要注意的是，一个 CTE 只在单个 SQL 范围内生效。

CTE 的语法格式是 `WITH ... AS ...`，并且必须和其他 SQL 一起使用。

```sql
-- 这里定义了一个 q1，它的内容就是 `SELECT sno, snam,sage FROM student WHERE sno = 95002` 产生的结果集，如果 q1 在此段 SQL 中用到了两次以上，那么优化器就会将结果集放到内存中
WITH q1 AS (
    SELECT sno, snam,sage FROM student WHERE sno = 95002
)
SELECT * FROM q1;

-- 这是 FROM 风格，它的作用和上面完全相同，但是不是很好理解
WITH q1 AS (
    SELECT sno, snam,sage FROM student WHERE sno = 95002
)
FROM q1
SELECT *;

-- 连续定义多个 CTE。顺带一说，CTE 虽然定义了，但是我们仍然可以不用。
WITH q1 AS (
    SELECT * FROM student WHERE sno = 95002
),
q2 AS (
    SELECT sno, sname, sage FROM q1
)
SELECT * FROM (
    SELECT sno FROM q2
) a;

-- UNION
WITH q1 AS (
    SELECT * FROM student WHERE sno = 95002
),
q2 AS (
    SELECT * FROM student WHERE sno = 95004
)
SELECT * FROM q1
UNION
SELECT * FROM q2;

-- INSERT
CREATE TABLE s1 LIKE student;
WITH q1 AS (
    SELECT * FROM student WHERE sno = 95002
)
FROM q1
INSERT OVERWRITE table s1 SELECT *;

-- TABLE
CREATE TABLE s2 AS WITH q1 AS (
    SELECT * FROM student WHERE sno = 95002
)
SELECT * FROM q1;

-- VIEW
CREATE VIEW v1 AS WITH q1 AS (
    SELECT * FROM student WHERE sno = 95002
)
SELECT * FROM q1;
```

在数据集非常大的情况下，使用 CTE 绝对是一个很好的选择。

## JOIN

传统的关系型数据库的设计基础原则就是三大范式。对于平常来说，我们不会将所有类型的数据全都放到一张大表中，而是根据业务和类型划分不同的表进行存储。

比如说，我们的订单表中可以使用外键来关联客户编号，而不会直接在订单表中填写客户的信息。

这种情况下，我们需要基于多张表来查询，最终形成完整的结果，这就是 JOIN。

Hive 作为面向分析数据的工具，整体来说和 RDBMS 的 JOIN 类似，不过有一些自己的特点。

**JOIN 语法**

在 Hive 中，当下支持六种语法，分别为：

`INNER JOIN（内链接）`、`LEFT JOIN（左外链接）`、`RIGHT JOIN（右外链接）`、`FULL OUTER JOIN（全外链接）`、`LEFT SEMI JOIN（左半开链接）`、`CROSS JOIN（交叉链接、笛卡尔积）`

**环境准备**

我们将以三张表为例子，来做 JOIN 练习：

```sql
-- 员工表
/*
    1201,gopal,manager,50000,TP
    1202,manisha,cto,50000,TP
    1203,khalil,dev,30000,AC
    1204,prasanth,dev,30000,AC
    1206,kranthi,admin,20000,TP
*/
CREATE TABLE employee(
    id int,
    name string,
    deg string,
    salary string,
    dept string
) ROW FORMAT DELIMITED
FIELDS TERMINATED BY ",";
LOAD DATA LOCAL INPATH '/tmp/hivedata/employee.txt' INTO TABLE employee;

-- 员工地址表
/*
    1201,288A,vgiri,jublee
    1202,108I,aoc,ny
    1204,144Z,pgutta,hyd
    1206,78B,old city,la
    1207,720X,hitec,ny
*/
CREATE TABLE employee_address (
id int,
hno string,
street string,
city string
) row format delimited
fields terminated by ',';
LOAD DATA LOCAL INPATH '/tmp/hivedata/employee_address.txt' INTO TABLE employee_address;

-- 员工联系方式表
/*
    1201,2356742,gopal@tp.com
    1203,1661663,manisha@tp.com
    1204,8887776,khalil@ac.com
    1205,9988774,prasanth@ac.com
    1206,1231231,kranthi@tp.com
*/
CREATE TABLE employee_connection (
    id int,
    phno string,
    email string
) row format delimited
fields terminated by ',';
LOAD DATA LOCAL INPATH '/tmp/hivedata/employee_connection.txt' INTO TABLE employee_connection;
```

**INNER JOIN**

最常见的一种链接，只有进行链接的两个表中均存在与链接条件相匹配的数据才会被保留下来。其中 `INNER JOIN` 和 `JOIN` 无区别。

```sql
-- INNER JOIN，等价于 JOIN
SELECT e.id, e.name, e_a.city, e_a.street
FROM employee e INNER JOIN employee_address e_a ON e.id = e_a.id;

-- WHERE 的等值连接等价于 INNER JOIN
SELECT e.id, e.name, e_a.city, e_a.street
FROM employee e, employee_address e_a WHERE e.id = e_a.id;
```

**LEFT JOIN**

左外链接，`LEFT JOIN`，或者叫做 `LEFT OUTER JOIN`，`OUTER` 可以省略。

它的核心就在于左，只要左表中存在符合的数据，那么肯定会返回，右表中关联不上的使用 `null` 来返回。

```sql
-- LEFT JOIN
SELECT e.id, e.name, e_a.city, e_a.street
FROM employee e LEFT JOIN employee_address e_a ON e.id = e_a.id;
```

**RIGHT JOIN**

右外链接，类似左外链接，以右表为主。

```sql
-- RIGHT JOIN
SELECT e.id, e.name, e_a.city, e_a.street
FROM employee e RIGHT JOIN employee_address e_a ON e.id = e_a.id;
```

**FULL JOIN**

全外链接，它的做法是：分别求出左外链接和右外链接，然后进行合并，之后进行去重操作。

```sql
-- FULL JOIN
SELECT e.id, e.name, e_a.city, e_a.street
FROM employee e FULL JOIN employee_address e_a ON e.id = e_a.id;
```

**LEFT SEMI JOIN**

左半开链接，从效果上看有点像 `INNER JOIN` 只返回左表的结果。

```sql
-- LEFT SEMI JOIN
SELECT e.id, e.name, e_a.city, e_a.street
FROM employee e LEFT SEMI JOIN employee_address e_a ON e.id = e_a.id;
```

**CROSS JOIN**

交叉连接，将会返回笛卡尔积，慎用。交叉连接其实在效果上就是无条件的 `INNER JOIN`，在 Hive 中，交叉链接后面可以跟上 WHERE 或者 ON 继续过滤。

```sql
-- CROSS JOIN
SELECT e.id, e.name, e_a.city, e_a.street
FROM employee e CROSS JOIN employee_address e_a ON e.id = e_a.id;
```

**JOIN 注意事项**

1. Hive 中，假如每个表在链接子句中使用到了相同的列，那么 Hive 将会将多个表上的链接转换为单个 MR 作业：

    ```sql
    -- 会转换为 2 个 MR 作业。
    -- 在第一个连接条件中使用了 b 中的 key1 列，而在第二个连接条件中使用了 b 中的 key2 列。
    -- 第一个 map / reduce 作业将 a 与 b 联接在一起，然后将结果与 c 联接到第二个 map / reduce 作业中。
    SELECT a.val, b.val, c.val
    FROM a JOIN b ON (a.key = b.key1) JOIN c ON (c.key = b.key2)

    -- 两个条件中，涉及相同内容 b 的 key1 列，因此被转换为 1 个 MR 作业来执行。
    SELECT a.val, b.val, c.val
    FROM a JOIN b ON (a.key = b.key1) JOIN c ON (c.key = b.key1)
    ```

1. JOIN 时的最后一个表会通过 reducer 流式传输，并且在其中缓冲之前的其他表，因此大表在最后利于减少 reducer 阶段缓存数据需要的内存。
1. JOIN 时可以通过语法 `STREAMTABLE` 提示需要进行流式传输的表，假如省略此关键字，则默认流式传输最右边的表。
1. JOIN 在 WHERE 之前执行。
