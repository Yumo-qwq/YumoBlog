---
title: 一个另类的数模经验分享
date: 2026-11-15 17:57
tags: [碎碎念, 观点]
categories:
  - 碎碎念
  - 观点
banner_img: /img/luo8th.png
index_img: /img/26-11-15/agent_logos.png
excerpt: 受贾老师邀请，给新生讲了一些经验，但不止局限于数模。
math: true
---
{% note info %}
这是分享的 slides 的 md 留档，如果你想看 slides 请点[**这里**](/slides/CUMCU2.html)
{% endnote %}


# 简要介绍数学建模

## 大学生竞赛

考虑到在场的各位都是大一学生，这里来简要介绍一下大学生竞赛。

大学生竞赛是一种非常好的能力锻炼，无论是实操能力、代码能力都能在参赛、备赛中获得很大的提升。

同时竞赛是一种对能力的证明，考研复试或工作都是很大的加分项。

## 数学建模

数学建模竞赛是教育部认可的84项全国大学生学科竞赛-A类竞赛名单的第五位，是非常有含金量的竞赛。

虽然是数学竞赛，但是面向所有学生，并且所需的前置知识包括但不限于：**高数、线代、概率、计算机仿真(`Matlab`)、程序设计(主要是 `Python`)、数据结构与算法**。

选手需要在在 A、B、C 三题中选一问， 72 小时内完成一篇论文并且提交，由组委会评奖。

一般 A 题需要选手更高等的数学水平，B 题比较灵活，C 题是数据科学方向的问题。

一般的组队策略是论文手、代码手、建模手，分别分工不同的方面，当然，在实际比赛中是比较灵活的。

---

# 一些个人介绍

## 个人信息

曾经是 XCPC 选手，主要负责数学方面的题目。

策划了本校 2026 算法竞赛新生赛。

在 2026 年数学建模中拿到了国家二等奖。

[个人博客](https://yumo.blog/)

[GitHub](https://github.com/Yumo-qwq)

## 个人奖项
- 2026 CCPC 福州全国邀请赛   bronze medal
- 2026 ICPC、CCPC 山东省赛  bronze medal
- 2026 CCPC 河南省赛        bronze medal
- 2026 程序设计天梯赛  团队国三、个人国三
  
（或许现在这里应该加上一个数模国二？）

--- 

# 关于对数学建模的理解

## 我在这个领域并非“专业”，只是接受过一些训练。

## 但这些训练带来的经验是可“搬迁”，甚至通用的。

如你所见，我在 XCPC 中担任数学手，而在本次数学建模中又担任代码手，非常“专业对口”，但并非是这样。

- XCPC 的数学内容包含：数论、组合、计算几何。
- 数学建模显然不考这些，与 CPC 有交叉的大概只有图论的内容（最短路、生成树等）。
- 往年的题目有涉及到几何，但是只有今年的 B 题算纯粹的计算几何问题，不知道以后还考不考。
- 比较幸运这次的 B 题碰巧全部是我会的东西：**计算几何、启发式搜索、TSP问题、json、http（与模拟器通信）**。
    - 客观来说，后面两个东西与数学建模几乎没有关系了，软件开发、网络编程才用得到。
    - 但是就是这么考了，极其“创新”。
     > 如果你们队模拟器没调明白，或许该 push 代码手了。

---

# GPT对历年计算几何赛题的统计

| 计算几何知识  | 对应赛题          | 重要算法或操作                       |
| ------- | ------------- | ----------------------------- |
| 向量与叉积   | 2012 D、2026 B | Orientation、叉积判定              |
| 线段相交    | 2012 D、2024 A | Segment Intersection          |
| 点到线段距离  | 2025 A、2024 A | Point-to-Segment Distance     |
| 凸包      | 2026 B        | Graham Scan、Andrew            |
| 半平面交    | 2026 B        | Half-plane Intersection       |
| 凸多边形直径  | 2026 B        | Rotating Calipers             |
| 最小覆盖圆   | 2026 B        | Minimum Enclosing Circle      |
| 圆与直线相交  | 2012 D、2025 A | Circle-Line Intersection      |
| 圆弧相切与切线 | 2012 D、2024 A | Tangent Construction          |
| 碰撞检测    | 2024 A        | SAT、OBB、线段交叉检测                |
| 障碍物路径规划 | 2012 D        | Visibility Graph、Dijkstra、A\* |
| 几何区域覆盖  | 2023 B        | Coverage、Polygon Intersection |
| 光线追踪与遮挡 | 2023 A        | Ray Casting、Projection        |

---

# 一些事先声明

## 对 AI 的态度与使用

个人对数学建模的准备尚不足以给大家以知识性上的经验分享，所以今天的内容会更着重于方法论上。

而知识性的内容在互联网上很容易找到，更何况我们现在有大模型了，学习效率比是传统授课方式高多了的。

作为人工智能专业本科生，我对 AI 的态度是：**彻底拥抱 AI**。
> 当然，个人认为每个人对新技术都该是这个态度，不过 AI 还是太特殊了。
 
并且我在本次数学建模中也大量使用了 AI，在中转站就花了接近 ￥300。

如果你能接受这一点，那么我们可以继续下面的分享：**怎么用 AI agent 辅助解题与写作，以及怎么最大化 Agent 的能力**。

---


# 数学建模的一些趋势（个人看法）

2026年组委会发布了[人工智能工具使用规定](https://www.mcm.edu.cn/html_cn/node/fef94648f2836ab6cc81586f4c38512b.html)

AI 工具的发展速度出乎所有人的意料，让组委会不得不去考虑 AI 对比赛的影响。

> 这个规定的制定肯定是有益的，比敌视新兴技术而固守泥潭强多了。

2026年 B题 这种综合性非常强的题目或许会继续出现。AI 拉高了选手的知识面与上限，一些创新是有必要的，至少对选手综合能力的考察不会停止。

## 怎么应对？或许后文会给你答案。

---

# 关于 Agent
作为 AI native 的一代人，我们理应对 AI 的能力有一个正确的认知。

Agent 是一个刚出现一年的东西，但它已经事实上改变了很多领域的运行规则。

- [OpenAI官宣攻克千禧年七大难题的NS方程问题](https://www.bilibili.com/video/BV1SdYn6cEoq/?spm_id_from=333.1387.homepage.video_card.click)
- [DeepSeek 刘胜与《我不得不把才华埋葬在昨天》](https://www.zhihu.com/question/2083123101873844765)
- [ICPC 西安站大模型解题数](https://post.smzdm.com/p/axkokodd/)
- [jyy：大学💊了吗](https://www.xiaohongshu.com/explore/6adf59fd000000001200db1a?xsec_token=ABU2-T4exAWtBbx_Syy5ThNRPWZHKDH2rgJJsBn4WU34o=&xsec_source=pc_note)

这种例子还可以举出来无数个。

而在数学建模上，Agent 已俨然成为了选手最大的助力。

## 请务必**自学**，这已是未来几年最值得投入时间金钱精力的东西。

然而受限于大学的滞后性，你大概到毕业也在课堂上学不到怎么用 Agent 做一个自己的小工具。但互联网可以教你。

---

# 介绍 Agent

Agent 的本质是一个能够使用工具、替人完成任务的大模型。

最好的学习方式是现在安装然后烧个一两百块 token，安装方式和使用方式都非常好找到。

看 AI 在各行各业的轰炸趋势，以后无论你从事什么行业大概都得用到，所以现在开始使用它一定是最优的选择。

![Agents](/img/26-11-15/agent_logos.png)

---


# 对论文手：Choose LaTeX

## Why LaTeX ?

对于工科的论文写作，`LaTeX` 几乎已经成为排版的最优解了，但很多人受困于 `LaTeX` 语法的复杂，转而去使用 agent 不友好的 word，这实际上并不是聪明的选择。

在 AI agent 时代，纯粹的文本信息才是第一性原理的，word、ppt、pdf 这种格式是对 Agent 能力的局限，AI 需要花费大量的上下文去处理排版。

借助 AI 来进行论文的写作，AI 直接对 `tex` 代码进行修改，排版直接体现在代码中，并且美观性更高，`tex` 不易读的唯一问题已经被 AI 解决掉了。

---

# LaTeX 应知须知
使用 `LaTeX` 前需要进行一些配置，虽然 Agent 已经可以完美做到这件事了，但是你必须自己理解编译 `tex` 的大致步骤。
> 配环境，不得不品的一环，不同的是现在可以让 AI 教你。

- `LaTeX` 基本语法、宏包、公式、图表    
- 图表与公式管理，建议了解：
    - `TikZ`：使用代码绘制结构图、流程图。
    - `Matplotlib`：生成科研绘图。
    - `SVG` / `PDF`：矢量图格式。
  
更核心的事情：本队所有人一定要都能看懂 Agent 写出来的论文。

如果你使用的不是能力非常强的 Agent，一定要确保没有它写的包括参考文献在内的所有东西都没有问题。

毕竟这是数学建模，而不是 Agent 使用大赛。

---

# 对代码手：或许现在你才是核心

以 2026 B题考察的内容的综合程度看，以后对计算机、代码能力的考察会变得更加深入。

对编程语言的了解、对实际工程的掌控、对各种工具的使用都是技能树上不可获取的部分。

以后的数模大概不止会考察写 Python 做仿真的能力，而是整体的素养。

## 或许后文的学习路径已经远超数模的范畴？

## 请相信，学会这些的益处远不止准备数学建模。

---

# CS 大致学习路径
> 00：[电子扫盲](https://www.bilibili.com/video/BV1JkzGYuEGo)

> 或者更基本一点的？[计算机义务教育](https://www.bilibili.com/video/BV12U8MeTE6G)

**01 · 计算机扫盲**

- 硬件、操作系统、文件、网络
- Windows / Linux、终端、Shell 
    - [华东师范大学 - 计算机教育中缺失的学期](https://www.bilibili.com/video/BV1GXz9YyEW9)
    - [浙江大学竺可桢学院 - 实用技能拾遗](https://www.bilibili.com/video/BV1t34y1g7YU)
        - 顺带一提，我也是看他们的第三、四讲学的 Markdown 和 LaTeX
- 魔法
- VS Code、环境配置

**02 · 编程能力**

- C/C++、Python、Java、JavaScript
- 数据结构与算法
- Git / GitHub、调试与版本管理

--- 

# CS 大致学习路径 续

**03 · 开发工具链**

- Node.js / npm、Python / pip
- HTTP / API、JSON
- 前端 Vue、后端 Express    
- SQL / PostgreSQL、Docker （数模大概用不到）

**对于数学建模，掌握到这些已经完全足够**。

## 自测：能否用 Node.js 启动一个前后端分离项目，并且能够增改代码来实现不同功能。

---

# CS 大致学习路径 续续
**04 · 工程实践**

- 从零开发完整项目
- 接口设计、数据库、测试、部署
- CI/CD、云、开源协作

**05 · 开源项目掌控**

- 阅读大型项目源码与架构
- 使用 AI Agent 辅助开发
- Fork、Issue、Pull Request
- 独立修改、扩展乃至维护项目


## 更多的 CS 学习路径
[CS自学指南](https://csdiy.wiki/)

---

# 另一些话

## 转码？

对自学爱好者 / 对计算机抱有兴趣的同学依旧是很好的选择。

## 乐观看待 AI

> AI 会平等地创死所有人，所以什么也不用学了?

驾驭 AI 的能力将变得更加重要，与其沉沦不如加入。

---

# 让我很有启发的人/文章/视频，推荐你们也去看

## 关于大学
- [上海交大生存手册](https://survivesjtu.gitbook.io/survivesjtumanual/li-zhi-pian/huan-ying-lai-dao-shang-hai-jiao-tong-da-xue)
- [软件工程与纸上谈兵](https://blog.lyc8503.net/post/4-years-at-nju/)
- [花钱用最好的 AI](https://www.zhihu.com/question/423780782/answer/2094108133140457382)

## 关于 AI
- [蒋炎岩：绿导师眼中的 AI 极乐末世](https://www.bilibili.com/video/BV1g7g26CEVQ/?spm_id_from=333.1387.favlist.content.click&vd_source=9d4703f9393c681aad9bfc97956985a1)
- [欢迎来到未来 [01-Raw/26生成式软件工程/NJU]](https://www.bilibili.com/video/BV1pb8o6yE8f)
- [为什么人人都应该学会用AI](https://www.bilibili.com/video/BV1mvGg6GE9D?spm_id_from=333.788.videopod.sections&vd_source=9d4703f9393c681aad9bfc97956985a1)
- [“大学高中化”会以一种什么方式结束？](https://www.zhihu.com/question/1959469871218815243/answer/2040135653556474214)

---

# 总结

作为一个非专业数模选手，我对数模的经验或许并不丰富，但以上这些训练带给我的方法论应当是有用的，希望对你有帮助。

## **不要等待大学教会你一切。**

## **你有能力利用互联网、开源社区和 AI，自主掌握那些尚未进入课堂的知识与技术。**

---

# Questions?

# 欢迎提问