---
title: CS61A Project 4 -- Scheme
date: 2025-11-27 23:31:27
tags: Python
categories: Python
excerpt: 个人Python课设留档。
index_img: /img/02.jpg
banner_img: /img/luo8th.png
---

# cs61a Project 4 -- Scheme

---

## abstract

本项目是 CS61A 的最后一个课程项目，旨在使用 Python 构建一个简易的 Scheme 解释器。该解释器能够解析、求值并执行 Scheme 语言中的基本表达式，包括数字、符号、布尔值、列表和函数调用。

---

## Scheme & Interpreter

解释器（interpreter） 是一种无需先将编程语言编译为机器代码即可执行源代码的软件。解释型语言通常通过解释执行源代码或先编译成中间表示（如字节码）再执行。相比编译型语言，解释器不直接生成完整的机器可执行文件。

Scheme 作为 Lisp 的一种方言，天生支持交互式执行。本项目旨在实现一个轻量级的 Scheme 解释器，其核心功能是提供一个命令行交互式环境（REPL）。通过这个 REPL，用户可以实时输入和执行 Scheme 代码（S-表达式），以交互和动态的方式测试 Scheme 程序。

---

## Core Data Structure

---

### Link

`Link` 类是 Scheme 列表的核心，所有的其他实现都基于此数据结构。

```python
class Link:
    empty = ()

    def __init__(self, first, rest=empty):
        self.first = first
        self.rest = rest

nil = Link.empty
```

每个 `Link` 节点都有两个属性：

`first`：当前元素

`rest`：后续元素（也是 `Link` 或 `nil`）

例如 `(+ 3 1)` 会被解析成：

```
Link('+', Link(3, Link(1)))
```

`Link` 类抽象了 **Scheme 的列表和链表**，以避免 Python 原生列表对 Scheme 语义的限制，同时更利于解释器其他功能的底层实现。

Python 列表是动态数组，而 Scheme 列表是链表式结构，用 `Link` 类可以更自然地表示递归的 S-表达式和空表 `nil`

---

### Frame

`Frame` 用来存储符号与值的绑定关系，且支持 **嵌套作用域**：

```python
class Frame:
    def __init__(self, parent):
        self.bindings = {}   # 当前 frame 的绑定值
        self.parent = parent # 父环境
```

其中 `bindings` 是一个Python 字典，用于实现绑定当前 `Frames` 的 names 与 value绑定。

借助 `Frame` 类，本解释器就可以实现 **词法作用域**，完成符号到值的映射。所有变量和函数调用都依赖这个链式环境。

---

### Procedure

在 Scheme 里，一切可调用的东西都是 **Procedure**，即“可执行的函数或操作”。
在解释器里，`Procedure` 是一个抽象基类，它定义了 **“可以被 apply 的对象”** 的接口。

`Procedure`包含以下子类：

- #### BuiltinProcedure 

​		用于封装 Python 写的内置函数（如 `+`、`*`、`print`）。

- #### LambdaProcedure

​		用于用户定义函数（`lambda` 或 `define` 定义的函数）。它会保存定义时的环境（闭包），调用时在该环境中查找自由变量

- #### MuProcedure

​		用于特殊用户定义函数，实现 **动态作用域**。调用时使用调用环境来解析自由变量，而不是定义环境

---

## REPL

REPL 是read–eval–print loop 的缩写，意为 **读取-计算-打印** 循环，是用户在命令行交互的一般过程。这也是总体上解释器的底层实现的概述，分别为：

- **读取**（read）：从字符串或文件读取 Scheme 表达式，并解析成内部表示，如 `Link` 列表、数字、布尔值或字符串
- **求值**（eval）：在环境中求值（变量查找、函数调用、特殊形式处理等）

- **打印**（print）：把结果转换成可读的字符串并输出

---

## The Reader

这部分是 **REPL** 的读取（**Read**）部分的实现逻辑。

这一步骤将用户的输入（字符串形式）转换成解释器内部的类型（`Link`类）

---

### Read 入口

在 `scheme.py` 的 REPL 中，读取是由 `scheme_read` 完成的：

```python
expression = scheme_read(src)
```

- `src` 是一个 **Buffer 对象**，代表当前输入的 token 流。
- `scheme_read` 的作用是：把 token 流解析成 **Scheme 内部表示**（S-expression）。

---

###  Buffer 对象

`Buffer` 对象在 `scheme_reader.py` 被封装，用于 **维护当前输入行的 token 列表**。

- **作用**：
  - 提供 `current()`：返回当前 token。
  - 提供 `pop_first()`：取出并移动到下一个 token。
  - 维护多行输入、逐 token 处理。
- **为什么要有它**：
  - Scheme 的输入可以跨行
  - 支持递归调用 `scheme_read` 处理嵌套的列表
  - 把字符串解析过程抽象成 **token 流**，方便递归解析。

---

### Read 过程

#### 1. token 化

 `scheme_tokens.py` 将字符串 转换为 token 流：

```python
tokenize_line("( + 3 1 )") 
# 返回 ['(', '+', 3, 1, ')']
```

#### 2 . 处理 token

 根据 token 类型做不同处理：

```python
def scheme_read(src):
    if src.current() is None:
        raise EOFError
    val = src.pop_first()
    if val == 'nil':
        return nil
    elif val == '(':
        return read_tail(src)
    elif val in quotes:
        return Link(quotes[val], Link(scheme_read(src), nil))
    elif val not in DELIMITERS:
        return val
    else:
        raise SyntaxError(...)
```

- `nil` → 空表 `nil`

- `'('` → 调用 `read_tail` 解析整个列表

- 引号（`'`, '`', `,`, `,`@`） → 生成对应的 `quote` / `quasiquote` 链表

- 其他普通 symbol/number/string → 直接返回

- 意外的 delimiter → 报错

#### 解析 token

```python
def read_tail(src):
    if src.current() is None:
        raise SyntaxError('unexpected end of file')
    elif src.current() == ')':
        src.pop_first()
        return nil
    else:
        first = scheme_read(src)
        rest = read_tail(src)
        return Link(first, rest)
```

- **作用**：
  - 递归解析 `( ... )` 内的所有元素
  - 每解析一个元素就用 `Link` 串起来
  - 遇到 `)` 就返回 `nil`，结束列表
- **举例**：

输入 `(+ 3 1)`：

1. `scheme_read` 遇到 `(` → 调用 `read_tail`
2. `read_tail`：
   - first = `scheme_read('+')` → 返回 '+'
   - rest = 递归解析 `3 1 )` → `Link(3, Link(1, nil))`
3. 最终返回：`Link('+', Link(3, Link(1, nil)))`

---

### Read 总结

**Read** 过程将用户输入的 Scheme 表达式解析成解释器可操作的内部结构。

将字符串拆解为 token，再递归构建 `Link` 链表或原子值，为后续的求值提供基础数据。

---

## The Evaluator

这部分是Scheme解释器的核心。

---

### define 与 lookup

每个 `Frame`（环境帧）对象具有以下实例属性：

- **`bindings`**: 一个字典（Python `dict`），表示该帧实例中的**变量绑定**。字典中的每一项将一个 **Scheme 符号**（表示为 Python 字符串）关联到一个 **Scheme 值**。

`Frame` 类下的 `define` 方法将支持 Scheme 解释器识别用户自定义 name 并将 其绑定到当前 `Frame` 下。

`lookup` 方法则将查找 name 是否绑定于 当前 `Frame` 以及 `parent Frame` 中的值，如果都没有找到则抛出 `SchemeError`。

```python
class Frame:
    def define(self, symbol, value):
        self.bindings[symbol] = value
    def lookup(self, symbol):
        if symbol in self.bindings :
            return self.bindings[symbol]
        if self.parent is not None:
            return self.parent.lookup(symbol)
        raise SchemeError('unknown identifier: {0}'.format(symbol))
```

---

### scheme_apply - BuiltinProcedure

`scheme_apply` 的作用是：根据过程的类型（**内建函数、lambda、mu**），将参数绑定到新的环境中并执行该过程，从而完成对 Scheme 函数的实际调用。

scheme_apply接受到以下参数：

- **`procedure`**: 要应用的过程对象（内建函数 / Lambda函数 / mu函数）。

- **`args`**: 一个 Scheme 列表，表示传入过程的**参数值**。它以 `Link` 对象或 `nil`（表示空列表）的形式表示。

- **`env`**: 当前的环境（`Frame` 对象）。

**`scheme_apply`** 函数能够处理 **BuiltinProcedure** 函数

即 Python 内建函数，在这里，参数初始是一个 Scheme 的链表结构 `Link`，Python 函数不能直接接收这种结构，所以必须转换成 	Python 能处理的普通列表。

这里需要注意的是：部分内建过程是需要 `env` 的（可以在 `scheme_builtin.py`）进行查看。所以当 `procedure.need_env` 为`True`

的时候，应当在 `py_args` 后添加`env`，而此时调用就应当使用动态数组： `procedure.py_func(*py_args)`

---

### scheme_eval

**`scheme_eval`** 是一个求值计算函数，用于处理表达式的运算。它与**`scheme_app`** 是相互递归的。

这是解释器设计模式中经典的：**「Eval–Apply 循环」**。

具体逻辑下：

`scheme_eval(expr, env)` 的任务是：**在某个环境 env 中，对 scheme 表达式 expr 求值。**

而Scheme 中的表达式分三类：

1. **符号（symbol）** → 从环境查变量
2. **自求值表达式**（数字、字符串、布尔值）
3. **列表（组合式）** → 函数调用 or 特殊形式

程序讲根据这三者做不同处理。

将表达式拆成两部分

```python
first, rest = expr.first, expr.rest
```

---

#### **symbol / number **

如果 `expr` 是一个 name，就去环境里查它绑定的值。

如果 `expr` 是数字、字符串、布尔值，它本来就是值，不需要再求值，直接返回。

实现如下：

```	python
if scheme_symbolp(expr):
    return env.lookup(expr)
elif self_evaluating(expr):
    return expr
```

---

####  special symbols

如果遇到特殊形式：

例如：

```scheme
(define x 10)
```

就调用对应的：

```python
SPECIAL_FORMS['define'](rest, env)
```

特殊形式用自己的规则，不走普通函数调用流程。

---

#### call expressions

`scheme_eval` 负责“求值表达式”，
`scheme_apply` 负责“应用过程”，
`map_link` 负责递归遍历参数列表并调用 scheme_eval。

这三者构成完整的：
 **Eval → Apply → Eval 递归循环**，是所有 Lisp 解释器的核心框架。

**`map_link` —— 递归处理参数链表**

```python
def map_link(f, s):
    if s is Link.empty:
        return s
    return Link(f(s.first), map_link(f, s.rest))
```

这是最直接的递归：

- **如果列表为空：停止递归**
- **否则：对头部应用函数 f，然后递归处理尾部**

用图表示：

```
(1 2 3)
↓
f(1) : f(2) : f(3)
```

如果 `f` 本身是 `scheme_eval`，例如：

```
arg_vals = map_link(lambda x: scheme_eval(x, env), rest)
```

就会变成：

```
eval(arg1) : eval(arg2) : eval(arg3)
```

👉 **所以，求值函数的递归由 `map_link` 来负责遍历参数列表。**

------

**`scheme_eval` —— “求值一个表达式”的递归**

`scheme_eval` 是解释器的核心，它本身不断调用自己：

```py
operator_val = scheme_eval(first, env)
arg_vals = map_link(lambda x: scheme_eval(x, env), rest)
```

这有两个递归方向：

------

**（1）递归求值 operator**

```
( +   2   3 )
  ↑
operator
```

`first` 可能是：

- `+`（符号）
- `(lambda (x) ... )`
- `(define ...)`
- 再嵌套 `( (foo bar) x )`

因此必须递归求值：

```
scheme_eval(first, env)
```

------

**（2）递归求值所有参数（用 map_link）**

```
(+   2   (* 3 4))
      ↑       ↑
    operand  operand
```

`map_link` 会为**每一个 operand** 调用：

```
scheme_eval(x, env)
```

比如：

```scheme
(* 3 4) ;12
```

也因此形成了嵌套结构。

------

scheme_eval 的递归来自两处

1. **递归求 operator**
2. **递归求每个 operand**

这就是 Scheme 的「先求 operator，再求 operands」。

------

实现如下：

```python
operator_val = scheme_eval(first, env)
arg_vals = map_link(lambda x: scheme_eval(x, env), rest)
return scheme_apply(operator_val, arg_vals, env)
```

这就是经典的 *Eval → Apply → Eval → Apply* 循环。

---

### define bind name

`define` 的一个特殊形式：scheme允许用户将一个表达式的值绑定到一个 name 上。

```python
signature = expressions.first
if scheme_symbolp(signature):
    validate_form(expressions, 2, 2)
    val = scheme_eval(expressions.rest.first, env)
    env.define(signature, val)
    return signature
```

`validate_form(expressions, 2, 2)` 确保参数数量正确。

当 `(define ...)` 的第一个参数是 symbol 时，使用`scheme_eval`进行对第二个参数进行求值运算，调用 `Frame` 类中定义的 `define` 方法将 `signature` 绑定到当前 `Frame` ，然后返回它本身。

---

### begin

`begin` 是scheme语法的一种特殊形式，逻辑如下：

**按顺序求值：** 表达式列表中的所有子表达式必须**按照它们出现的顺序依次求值**。

**返回最终值：** `begin` 表达式的最终值是**最后一个子表达式的求值结果**。中间表达式的求值结果会被丢弃，但它们的**副作用**（如 `display` 或 `define`）会被保留。

```python
def eval_all(expressions, env):
	result = None
    while expressions is not nil:
    	result = scheme_eval(expressions.first, env)
        expressions = expressions.rest
    return result
```

依次调用 `scheme_eval` 来执行每个表达式，最后返回最后一个表达式的结果。

---

### do_lambda_form

`do_lambda_form` 负责处理 如下形式的 Scheme 语句：

```scheme
(lambda (params...) body1 body2 ... bodyN)
```

比如：

```scheme
(lambda (x y) (+ x y))
```

#### **LambdaProcedure 类**

```python
class LambdaProcedure(Procedure):
    def __init__(self, formals, body, env):
        self.formals = formals  # 参数列表 (Link 类型)
        self.body = body        # body 是一个 Link，可能有多个表达式
        self.env = env          # 定义此 lambda 的环境
```

 `formals` 是 `Link` 类型（参数列表）

 ` body` 是一个 `Scheme list`（不仅仅是一条表达式）

 `env` 是 lambda 定义时的环境（**词法作用域**）

`do_lambda_form`要把 Scheme 的 `(lambda ...)` 转成一个 `LambdaProcedure` 对象。

实现如下：

```python
def do_lambda_form(expressions, env):
    validate_form(expressions, 2)
    formals = expressions.first
    validate_formals(formals)
    body = expressions.rest
    return LambdaProcedure(formals, body, env)
```

它将表达式（`Link` 类）的两个部分分别转换为了一个`LambdaProcedure` 对象，用于实现Lambda函数的效果。

---

### Frame.make_child_frame

`Frame.make_child_frame` 用于 **函数调用时创建局部环境**。我们从解释器运行流程的角度来看它的作用。

假设你有一个 Scheme 函数：

```scheme
(define add (lambda (x y) (+ x y)))
```

当你调用：

```scheme
(add 3 5)
```

解释器需要做几件事情：

1. 找到 `add` 对应的 `LambdaProcedure`。
2. 根据这个 `LambdaProcedure` 的参数 `(x y)` 和调用时传入的值 `(3 5)` 创建一个 **新的局部环境**。
3. 在这个局部环境里执行函数体 `(+ x y)`。

这里的 “新的局部环境” 就是 `make_child_frame` 的工作。

```python
def make_child_frame(self, formals, vals):
    if len_link(formals) != len_link(vals):
        raise SchemeError('Incorrect number of arguments to function call')
    child = Frame(self)
    f, v = formals, vals
    while f is not nil:
        child.define(f.first, v.first)
        f = f.rest
        v = v.rest
    return child
```

方法的作用：

1. **检查参数数量是否匹配**
   如果 `len(formals) != len(vals)`，就抛出 `SchemeError`。

2. **创建一个新的 Frame**

   ```
   child = Frame(self)
   ```

   新 frame 的父环境就是函数定义时的环境 `self`，保证 **词法作用域**。

3. **把参数和实参绑定到新 frame**
   遍历 formals 和 vals，把每个参数名绑定到对应的值：

   ```
   child.define(f.first, v.first)
   ```

4. **返回这个新的 Frame**
   后续函数体的求值就发生在这个 frame 里。

---

### scheme_apply - LambdaProcedure

实现了 **调用用户自定义函数（`LambdaProcedure`）** 的逻辑

在 `scheme_apply(procedure, args, env)` 中，参数：

- `procedure` 是要调用的 `LambdaProcedure`。
- `args` 是实际传入的参数（Scheme 链表）。
- `env` 是函数调用时的当前环境（调用者的环境）。

当 `procedure` 是 `LambdaProcedure` 的实例时，就进入这个块。

**创建新的局部环境（Frame）**

```
new_frame = procedure.env.make_child_frame(procedure.formals, args)
```

- `procedure.env` 是 **函数定义时的环境**（闭包保存的环境）。
- `procedure.formals` 是函数的参数列表。
- `args` 是调用时的实际参数。
- `make_child_frame` 会返回一个新的 Frame，把每个参数名绑定到对应的值。
- **注意**：这里的父环境是函数定义时的环境，不是调用时的环境，保证词法作用域。

------

**在新环境中求值函数体**

```
return eval_all(procedure.body, new_frame)
```

- `procedure.body` 是函数体的 Scheme 表达式链表。
- `eval_all` 会按照顺序求值每一个表达式，并返回最后一个表达式的值。
- 所有表达式的求值都在 `new_frame` 里进行，这样函数体内部的变量引用都正确。

```python
def scheme_apply(procedure, args, env):
	if isinstance(procedure, LambdaProcedure):	
		new_frame = procedure.env.make_child_frame(procedure.formals, args)
		return eval_all(procedure.body, new_frame)
```

---

### define bind function

原本你的 `do_define_form` 只能处理这种形式：

```
(define f (lambda (x) (* x 2)))
```

Python 里会先求值右边的表达式，然后调用 `env.define('f', LambdaProcedure(...))`

但是在实际使用中，我们常用这种 **简化形式**：

```
(define (f x) (* x 2))
```

实现如下：

```
elif isinstance(signature, Link) and scheme_symbolp(signature.first):
    function_name = signature.first         # f
    formals = signature.rest                # (x y)
    body = expressions.rest                 # ((+ x y)) 可能多条表达式
    lambda_proc = do_lambda_form(Link(formals, body), env)
    env.define(function_name, lambda_proc)
    return function_name
```

这是一个把 `define` 关键字 bind到 用户自定义函数的过程

(define (f x y) (+ x y))

expression : (f x y) (+ x y)

expression.first : (f x y)    -> signature

expression.rest : ((+ x y))     -> body

signature.first : f           -> function_name

signature.rest : (x y)          -> formals

对后面的 formals 和 body 部分使用 ` lambda `函数过程，构造一个`LambdaProcedure` closure

最后将该 `LambdaProcedure` 绑定到环境中的符号 `function_name`，返回函数名。

---

### scheme_apply - MuProcedure

在前面我们实现的 `LambdaProcedure` 使用的是 **词法作用域（lexical scoping）**：

- Lambda 的新调用帧的父环境是 **定义 Lambda 的环境** (`procedure.env`)。
- 所以函数调用时访问的变量，是定义时环境里的变量，而不是调用时的环境。

**`MuProcedure`** 则使用 **动态作用域（dynamic scoping）**：

- 新调用帧的父环境是 **调用 `MuProcedure` 的环境**。
- 所以同一个 `MuProcedure` 在不同地方调用时，可能会访问不同的变量。

```python
def do_mu_form(expressions, env):
    validate_form(expressions, 2)
    formals = expressions.first
    validate_formals(formals)
    body = expressions.rest
    return MuProcedure(formals, body)
```

```python
elif isinstance(procedure, MuProcedure):
	new_frame = env.make_child_frame(procedure.formals, args)
    return eval_all(procedure.body, new_frame)
```

和 `LambdaProcedure` 唯一的区别是：

`LambdaProcedure` 的父环境是 `procedure.env`，而 `MuProcedure` 的父环境是 `env`（调用时环境）。

---

### do_and_form & do_or_form

在 Scheme 中，`and` 与 `or` 是两种逻辑特殊形式（logical special forms），它们的特点是 **短路求值**（short-circuit evaluation），即根据需要仅计算必要的子表达式，而不是全部求值。

------

####  `and` 

- `(and expr1 expr2 ... exprN)`
- 逐个求值每个子表达式。
- **短路规则**：一旦出现 `#f`（False）值，就立即返回该值，不再计算后续表达式。
- 若所有表达式都为真，返回最后一个表达式的值。
- 空表达式 `(and)` 默认返回 `#t`（True）。

**Python 实现：**

```python
def do_and_form(expressions, env):
    if expressions is nil:      # (and) => #t
        return True

    result = True
    while expressions is not nil:
        result = scheme_eval(expressions.first, env)
        if is_scheme_false(result):   # 短路
            return result
        expressions = expressions.rest
    return result                      # 最后一个真值
```

------

####  `or` 

- `(or expr1 expr2 ... exprN)`
- 逐个求值每个子表达式。
- **短路规则**：一旦出现非 `#f`（True）值，就立即返回该值，不再计算后续表达式。
- 若所有表达式都为假，返回 `#f`。
- 空表达式 `(or)` 默认返回 `#f`。

**Python 实现：**

```python
def do_or_form(expressions, env):
    if expressions is nil:   # (or) => #f
        return False
    
    result = False
    while expressions is not nil:
        result = scheme_eval(expressions.first, env)
        if is_scheme_true(result):  # 短路
            return result
        expressions = expressions.rest
    return result  
```

------

- **短路求值**是 `and` 与 `or` 的核心特性，保证了表达式不会过度求值，从而符合 Scheme 规范。
- `do_and_form` 与 `do_or_form` 都会通过 `scheme_eval` 在当前环境 `env` 中计算每个子表达式的值，并根据逻辑规则决定是否继续求值或返回结果。
- 空列表情况下有默认返回值：`(and)` → `#t`，`(or)` → `#f`。

---

### do_cond_form

`do_cond_form` 实现了 Scheme 中的 **`cond` 特殊形式**，用于多分支条件判断，类似于其他语言中的 `if-elif-else`。

#### 功能概述

- 接收一个由若干条件子句组成的 **Scheme 列表** `expressions`，以及当前环境 `env`。
- 按顺序依次检查每个子句：
  - 子句的第一个元素是 **条件表达式**。
  - 条件为真时，求值子句的其余表达式，并返回最后一个表达式的值。
- 如果条件为 `else`，则总是返回其对应的结果，并且必须是最后一个子句。
- 如果没有子句为真，则 `cond` 返回 `None`（对应 Scheme 中的 `undefined`）。

------

#### 示例

```scheme
(cond
  (#f (print 2))
  (#t 3))
```

- **解析为 Link 列表**：

```python
Link(Link('#f', Link(Link('print', Link(2)))), Link(Link('#t', Link(3))))
```

- **执行逻辑**：
  1. 第一子句 `(#f (print 2))` 条件为假，跳过。
  2. 第二子句 `(#t 3)` 条件为真，返回 `3`。

------

#### 实现

1. **循环遍历所有子句**：

   ```py
   while expressions is not nil:
       clause = expressions.first
   ```

2. **验证子句**：

   ```
   validate_form(clause, 1)
   ```

3. **处理 `else` 子句**：

   ```python
   if clause.first == 'else':
       test = True
       if expressions.rest != nil:
           raise SchemeError('else must be last')
   else:
       test = scheme_eval(clause.first, env)
   ```

4. **条件为真时**：

   - 如果子句只有条件，没有结果表达式，直接返回条件值。
   - 否则，使用 `eval_all` 计算子句的结果表达式序列，并返回最后一个值：

   ```python
   if is_scheme_true(test):
       if clause.rest is nil:
           return test
       else:
           return eval_all(clause.rest, env)
   ```

------

#### 特点

- **短路求值**：一旦找到第一个为真的子句就立即返回，不会继续检查后续子句。
- **支持多表达式子句**：子句中可以有多个表达式，返回最后一个表达式的值。
- **与其他逻辑形式类似**：和 `if`, `and`, `or` 一样，`cond` 是一种短路求值特殊形式。

---

### Evalutor 总结

Evaluator 部分实现了 Scheme 的核心求值逻辑：

1. **表达式求值**
   - 原子（数字、符号、布尔值）
   - 组合（函数调用、特殊形式）
2. **函数调用**
   - 内建函数（BuiltinProcedure）
   - 用户定义函数（LambdaProcedure）
   - 动态作用域函数（MuProcedure）
3. **作用域管理**
   - 利用环境 Frame 链表实现静态/动态作用域
   - 支持多层嵌套函数调用
4. **递归求值**
   - `scheme_eval` 与 `scheme_apply` 互相递归
   - 支持任意深度表达式和函数调用

这个模块是解释器的 “**计算核心**”，所有表达式求值、函数调用以及环境管理都通过它完成。

---

## The Printer

### read_eval_print_loop

`read_eval_print_loop` 是 Scheme 解释器中 **REPL（Read–Eval–Print Loop）** 的核心实现。它不断从输入读取 Scheme 表达式，求值，并将结果输出，直到遇到文件结束（EOF）或用户中断（Ctrl-C）。

- **Read**：从输入流读取 Scheme 表达式
- **Eval**：在给定环境 `env` 中求值
- **Print**：将求值结果以 Scheme 风格输出到屏幕

实现：

```python
def read_eval_print_loop(next_line, env, interactive=False, quiet=False,
                         startup=False, load_files=(), report_errors=False):
    """Read and evaluate input until an end of file or keyboard interrupt."""
    if startup:
        for filename in load_files:
            scheme_load(filename, True, env)
    while True:
        try:
            src = next_line()
            while src.more_on_line():
                expression = scheme_read(src)
                result = scheme_eval(expression, env)
                if not quiet and result is not None:
                    print(repl_str(result))
        except (SchemeError, SyntaxError, ValueError, RuntimeError) as err:
            if report_errors:
                if isinstance(err, SyntaxError):
                    err = SchemeError(err)
                    raise err
            if (isinstance(err, RuntimeError) and
                'maximum recursion depth exceeded' not in getattr(err, 'args')[0]):
                raise
            elif isinstance(err, RuntimeError):
                print('Error: maximum recursion depth exceeded')
            else:
                print('Error:', err)
        except KeyboardInterrupt:  # <Control>-C
            if not startup:
                raise
            print()
            print('KeyboardInterrupt')
            if not interactive:
                return
        except EOFError:  # <Control>-D, etc.
            print()
            return
```

---

### Print

在函数里，打印发生在这一段：

```python
result = scheme_eval(expression, env)
if not quiet and result is not None:
    print(repl_str(result))
```

1. **求值结果**
   `scheme_eval(expression, env)` 会返回表达式在当前环境下的求值结果：

   - 对于原子表达式（数字、布尔值、符号等），直接返回对应的 Python 类型（如 `int`, `bool`, `str`）。
   - 对于组合表达式（函数调用、Lambda、Mu、特殊形式），返回函数对象（如 `LambdaProcedure`）或函数调用的返回值。
   - 对于 `begin`、`cond`、`and`、`or` 等特殊形式，返回最后一个求值表达式的值。

2. **是否打印**

   - `quiet` 标志决定是否抑制输出（例如批量加载文件时可能不希望输出每条结果）。
   - `result is not None` 防止打印 Python 的 `None`（对应 Scheme 的 `undefined`）。

3. **格式化输出**

   - 使用 `repl_str(result)` 将 Python 对象转换成 Scheme 风格的字符串。

   - 例如：

     ```python
     repl_str(42) -> '42'
     repl_str(True) -> '#t'
     repl_str(False) -> '#f'
     repl_str(Link(1, Link(2))) -> '(1 2)'
     repl_str(LambdaProcedure(...)) -> '#[lambda]'
     ```

   - 这样用户在 REPL 里看到的就是标准的 Scheme 表示，而不是 Python 对象的原生格式。

4. **打印到屏幕**

   - `print(repl_str(result))` 将格式化后的字符串输出到标准输出（通常是终端/控制台）。
   - 这是用户与解释器交互的可视化部分：每次表达式求值完成后，用户立即看到结果。

------

### 异常

除了打印正常结果，`read_eval_print_loop` 还会捕获并输出错误：

```
except (SchemeError, SyntaxError, ValueError, RuntimeError) as err:
    ...
    print('Error:', err)
```

- 如果用户输入了非法表达式或调用错误，解释器不会崩溃，而是打印 `'Error:'` + 错误信息。
- 对递归深度超限的情况，也会特别提示 `'Error: maximum recursion depth exceeded'`。
- 这样用户可以及时看到出错信息，并继续交互。

------

### Print 总结

1. **打印是通过 `print(repl_str(result))` 实现的**。
2. **`repl_str`** 保证了结果符合 Scheme 风格。
3. **错误输出** 统一打印到屏幕，保证用户可见。
4. **REPL 的核心作用**：Read → Eval → Print → 循环，打印是最后一步，把解释器求值的结果反馈给用户，完成交互体验。

`read_eval_print_loop` 是解释器的 **交互入口**，实现了 Scheme 的 REPL：

1. 持续读取输入
2. 求值表达式
3. 打印结果或错误信息
4. 处理用户中断与文件结束

它把 **Read → Eval → Print** 流程完整串起来，是整个解释器运行的核心循环。

---

## conclusion

至此，这个解释器已经实现了完整的 Scheme Interpreter 核心功能：

1. **表达式求值**
   解释器能够处理各种类型的表达式，包括原子表达式（如数字、布尔值、符号）和组合表达式（函数调用和嵌套列表）。对于特殊形式，如 `define`、`lambda`、`mu`、`if`、`and`、`or`、`cond` 和 `begin`，解释器能够正确识别并执行相应逻辑，同时保证求值顺序和作用域的正确性。
2. **函数调用**
   支持内建函数（`BuiltinProcedure`）以及用户自定义函数（`LambdaProcedure` 和 `MuProcedure`）。解释器能够正确处理函数参数绑定、闭包环境捕获和递归调用。Lambda 函数遵循词法作用域（Lexical Scoping），Mu 函数则实现动态作用域（Dynamic Scoping），两者的父环境处理机制不同，使得解释器能够灵活支持不同类型的作用域规则。
3. **控制流**
   解释器实现了条件表达式和逻辑运算的短路求值机制，如 `if`、`and`、`or` 等。同时支持多分支条件 `cond`，以及顺序执行的 `begin` 表达式。每种控制结构都能保证正确的求值顺序，并在必要时返回最后一个表达式的值。
4. **REPL 循环**
   完整实现了 Read-Eval-Print Loop 模型。解释器能够持续读取用户输入，将输入解析为内部链表结构，进行求值，并打印结果。支持多表达式输入、错误处理（语法错误、运行时错误、递归深度溢出等）以及用户中断（KeyboardInterrupt、EOF）。此外，解释器可加载外部文件并执行其中的 Scheme 代码，为用户提供完整交互式编程环境。

综上所述，本项目实现了一个功能完备的 Scheme 解释器，能够正确解析和求值多种表达式，支持闭包与作用域规则，具备完善的控制流和交互功能。该解释器不仅可用于学习和测试 Scheme 语言特性，也为理解 Lisp 家族语言的求值机制、作用域管理和函数闭包提供了直观的实践工具。