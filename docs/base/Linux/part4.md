---
title: Linux-04-Shell
category:
- base
tag:
- linux
author: causes
---

## Shell 概述

Shell 俗称壳，是用来和操作系统打交道的一层马甲。同时 Shell 也是一种程序设计的语言，是一个用 C 编写的程序，是使用 Linux 的桥梁。

我们的 Shell 脚本就是使用 Shell 语言，为 Shell 编写的脚本程序。我们之后的 Shell 都作为 Shell 脚本编程，而不是开发 Shell 本身。

**Shell 环境**

Linux 的 Shell 种类众多，常见有：

- Bourne Shell：`/usr/bin/sh` 或 `/bin/sh`
- Bourne Again Shell：`/bin/bash`
- Shell for Root：`sbin/sh`
- ……

因为免费、易用，在中国广泛用到的都是 Bash（Bourne Again Shell），同时 Bash 也是大多数 Linux 的默认 Shell。一般情况下我们不区分。Bourne Shell 和 Bourne Again Shell。

所以 ` #!/bin/sh`，它同样也可以改为 `#!/bin/bash`。

**快速起步**

新建文件 `hello.sh`，输入以下内容：

```bash
#!/bin/bash
echo "HELLO WORLD"
```

之后在命令行中，使用 `sh hello.sh` 来执行脚本，控制台上将会打印出 `HELLO WORLD`。还可以使用 `chmod` 给与脚本可执行权限，即可不加 `sh` 命令执行。

在上面这个脚本中：

- `#!/bin/bash` 是一个约定标记，告诉系统应该使用 `/bin/bash` 这个 shell 来执行脚本，我们自然也可以换为其他的。
- `echo` 是一个命令，用于向窗口输出文本。

## 变量和注释

**变量基本使用**

在 Shell 中，定义变量不需要加任何修饰符，但是引用变量需要加入 `$` 符号引用，定义变量有如下注意点：

- 只能用英文、数字、下划线，首个字符不可使用数字。
- 变量和等号中间不可使用空格。
- 不可使用 bash 中的关键字。

```bash
#!/bin/bash
# 定义变量
shell="SHELL"
# 使用变量，也可以使用 ${shell} 的方式来使用
echo $shell
# 更改变量的值
shell="shell"
# 删除变量，从这一行往下，shell 这个变量就被删除了
unset shell
# 定义只读变量，只读变量不可更改，不可删除
readonly name="tom"
```

**变量作用范围**

在 shell 中，变量有三种作用范围：

- 局部变量：作用于单个的 shell 脚本，或者单个脚本的某块语句。
- 环境变量：作用于所有程序，包括 shell 启动的程序。环境变量可以保证某些程序的正常运行，必要时可以使用 shell 脚本来定义。
- shell 变量：shell 中的特殊变量，shell 变量中有一部分是环境变量，有一部分是局部变量。

**注释**

在 shell 中单行注释使用 `#` 开头。多行注释使用以下格式：

```bash
:<<EOF
多行注释方式 1
EOF

:<<!
多行注释方式 2
!

:<<'
多行注释方式 3
'
```

## 字符串

```bash
#!/bin/bash
shell="SHELL"
# 双引号字符串，可以使用 ${shell} 的方式使用 shell 变量，这行如果输出将会是 SHELL。双引号中也可以出现转义字符。
str = "${shell}"
# 单引号字符串，不可以使用 shell 变量，这行如果输出将会是 ${SHELL}。单引号中不可出现转义字符。
str='${shell}'
# 取得字符串长度
echo ${#str}
# 截取字符串，从 0 号位开始，截取两个字符，注意，假如使用了 sh 执行脚本，在 ubuntu 报错不要慌张，ubuntu /bin/bash 连接的是 /bin/dash 而不是传统的 /bin/bash
# 解决方法是在终端执行 sudo dpkg-reconfigure dash，之后选择 no，或者直接使用 bash 或者 ./ 执行
echo ${str:0:2}
# 找到变量 shell 中，H 的第一个索引，注意，这里使用的是反引号
echo `expr index "$shell" H`
```

## 传递参数

在 shell 脚本执行时，我们可以传递参数，格式为 `$n`，其中 `$0` 代表 `文件名`，从 `$1` 开始代表传递的第几个参数，比如：

```bash
#!/bin/bash
# 文件名
echo $0
# 第一个参数
echo $1
# 第二个参数
echo $2
# 传递到脚本的参数个数
echo $#
# 单字符串的形式输出所有参数，还有 $@ 功能相同，不同点是 * 代表传递了一个参数字符串结果，而 @ 是多个参数拼成了结果
echo $*
# 脚本运行的进程 ID
echo $$
```

执行 `bash hello.sh 1 2`，得到

```
hello.sh
1
2
2
1 2
34949
```

## 数组

bash shell 仅支持一维数组，不需要定义数组大小，不需要定义数组元素类型，数组使用括号表示，元素间使用空格分开。

```bash
#!/bin/bash
# 直接定义
arr=(1 2 "3" 4)
# 下标定义
arr[4]=5
# 获取某元素
echo "${arr[0]}"
# 获取所有元素，arr[*] 也可以
echo "${arr[@]}"
# 获取长度
echo "${#arr[@]}"
```

## 表达式（运算符）

原生 bash 不支持数学运算，但是可以使用 `awk` 和 `expr` 来实现，其中 `expr` 更常用，可以完成表达式操作。

**普通运算符**

```bash
#!/bin/bash
:<<EOF
1. expr 表达式计算工具，注意使用的是反引号
1. 支持 + - * / % == !=，但是乘法需要使用转义字符。
1. mac 中的 shell expr 的语法是 $(())，并且乘法不需要转义符号
EOF
a=10
b=20
echo `expr $a + $b`
# 关系型运算符仅支持数字，或者字符串类型的数字。使用 if 语句来做判断，之后的流程控制有章节
# 关系运算符
if [ $a -eq $b ]
then
  echo "$a == $b"
else
  echo "$a != $b"
fi

if [ $a -ne $b ]
then
  echo "$a != $b"
else
  echo "$a == $b"
fi

if [ $a -gt $b ]
then
  echo "$a > $b"
else
  echo "$a <= $b"
fi

if [ $a -ge $b ]
then
  echo "$a >= $b"
else
  echo "$a <= $b"
fi

if [ $a -lt $b ]
then
  echo "$a < $b"
else
  echo "$a >= $b"
fi

if [ $a -le $b ]
then
  echo "$a <= $b"
else
  echo "$a > $b"
fi

# !：非，-o（or）：或，也可以使用 || 代替；-a（all）：与，也可以使用 && 代替
if [ $a != $b -o $a == $b ]
then
  echo "true"
else
  echo "false"
fi

if [ $a != $b -a $a == $b ]
then
  echo "true"
else
  echo "false"
fi
```

**字符串运算符**

```bash
#!/bin/bash
# 字符串运算符：
# 1. `=` 检测两者是否相等，`!=` 检测两者是否不等。
# 2. `-z` 检测字符串长度是否为 0，`-n` 检测字符串长度是否不为 0.
# 3. `$` 检测字符串是否为空。
shell="SHELL"
if [ -z $shell ]
then
  echo  "str length is zero"
else
  echo "str lenth is not zero"
fi

if [ $shell ]
then
  echo "str is null"
else
  echo "str not null"
fi
```

**文件运算符**

```bash
#!/bin/bash
# 文件运算符
# 1. `-d`：是否为目录
# 2. `-f`：是否为普通文件
# 3. `-r`：文件是否可读
# 4. `-w`：文件是否可写
# 5. `-x`：文件是否可执行
# 6. `-s`：文件是否为空
# 7. `-e`：文件/目录是否存在
file="/home/user/log"
if [ -e $file ]
then
  echo "file is exists"
else
  echo "file is not exists"
fi
```

## echo 与 printf

echo 没啥好说的，说一下 printf。printf 模仿 c 中的 `print()`，可以格式化字符串。

printf 格式化：

- `%s` 输出字符串。

    `%-10s` 表示任何字符不够 10 个使用空格补充，超出的部分会显示出来：`printf %-10s helloworldhelloshell`

- `%d` 输出整型。
- `%c` 输出字符。
- `%f` 以小数形式输出实数。

    `%-4.2f`:格式化为小数，并且保留两位小数。

## 流程控制

shell 中的条件判断可以使用 `test` 语句，也可以使用 `[]` 做判断。不过 `test` 仅可以判断数值、字符、文件三个测试，比如

```bash
a=10
b=20
if test $a -eq $b
then
  echo "a > b"
else
  echo "a <= b"
fi
```

**if - else**

```bash
# 多行
if condition
then
    commands
fi
```

```bash
# 一行
if condition; then commands; fi;
```

```bash
if condition; then
    commands
else
    commands
fi
```

```bash
if condition; then
    commands
elif condition; then
    commands
else
    commands
fi
```

**for**

```bash
for var in item1 item2 item3 .... itemN
do
    commands
done
```

```bash
for var in item1 item2 item3 ... itemn; do commands; done
```

循环中存在 break 和 continue。

**while**

```bash
while (( condition ))
do
    commands
done
```

循环中存在 break 和 continue。

**until**

```bash
until condition
do
    commands
done
```

循环中存在 break 和 continue。

**case - esac**

```bash
case value in
    value1)
        commands
    ;;
    value2)
        commands
    ;;
    ...
    *)
        commands
    ;;
esac
```

## 函数

shell 中可以定义用户函数，之后在 shell 中可以随意调用。自定义函数：

```bash
[ function ] funname  [()]

{
    action;

    [return int;]
}
```

1. 可以带 `function fun()` 定义，也可以直接 `fun()`。
1. 参数返回时可以显示加 return 返回，如果不加则将最后一条命令结果返回，return 后跟数值 0-255。

```bash
#!/bin/bash
fun() {
  echo "demo function"
  return 0
}
# 直接调用，注意，在 shell 中 0 代表 true，其余为 false
fun
funWithParam() {
  echo $1
  echo $2
  return $(($1+$2))
}
# 带参数调用
funWithParam 1 2
# 函数返回值在调用之后使用 $? 获取，$? 指令仅对其上一条指令负责，一旦函数返回值没有立刻获取就再也获取不到了。
echo $?
```

## 重定向

重定向的意思是指使用文件来代替标准输入、标准输出、标准错误输出。

比如说，平常使用 `echo` 将会打印到终端上，但是使用了重定向之后，完全可以打印到某个文件中。

|              | 代码 | 运算符    |
| ------------ | ---- | --------- |
| 标准输入     | 0    | < 或 <<   |
| 标准输出     | 1    | > 或 >>   |
| 标准错误输出 | 2    | 2> 或 2>> |

在这其中，有一个箭头的表示使用覆盖的方式进行重定向，两个箭头的方向表示使用追加的方式来重定向。

| 命令            | 说明                  |
| --------------- | --------------------- |
| command > file  | 文件输出覆盖写到 file |
| command >> file | 文件输出追加到 file   |
| n >& m          | 输出文件 n 和 m 合并  |

`n>&m` 有很多实现，比如 `command >> file 2>$1` 代表将错误输出和标准输出合并输出到 file 中

**垃圾桶**
如果希望执行某个命令，但是不希望日志保存下来，那么就可以丢到垃圾桶 `/dev/null`，这是一个特殊文件，任何写入到它的内容都会被丢弃。

## 引用外部文件

shell 可以包含外部脚本，这样可以有效封装一些公用代码作为独立文件。文件包含的语法如下：

```bash
# 注意点号
. filename
# 或者直接使用
source filename
```
