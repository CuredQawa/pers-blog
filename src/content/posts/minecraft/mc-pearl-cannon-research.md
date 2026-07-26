---
title: 从 FTL 到弱加载与空爆：Minecraft Java 珍珠炮技术谱系
published: 2026-07-26
description: 梳理 Java 版生电珍珠炮的机制、模块、关键迭代、版本断点与公开贡献归属。
image: ""
tags:
  - Minecraft
  - 生电
  - 珍珠炮
  - 红石
  - 技术考据
category: Minecraft
draft: false
lang: zh-CN
---

> 本文资料核对截止于 **2026-07-26**。讨论对象是 Minecraft Java Edition 原版或近原版技术生存中的末影珍珠炮，不包含基岩版机制，也不把普通珍珠静滞室、玩家炮或仅用于展示的命令装置混为一谈。

珍珠炮没有公认的“第一代、第二代”官方编号。不同社区更常以项目名、当量、炮口或加载方式称呼设计。因此，本文所谓“代际”只是按**能力跃迁**整理技术史：定向远射、矢量化、工程化、弱加载蓄力、高版本适配，不能拿来替代原作者的项目名和 credits。

## 先说结论

珍珠炮不是把玩家直接炸出去，而是把**仍绑定投掷者的末影珍珠**加速到目标处；珍珠发生碰撞后，游戏再执行传送。完整系统解决的并不只是“放多少 TNT”，而是以下问题：

1. 如何让每颗珍珠以可重复的亚方块位置和速度进入炮口；
2. 如何复制、压缩并精确选择推进药量；
3. 如何把若干固定方向的爆炸冲量合成为任意水平向量；
4. 如何让沿途区块以预期等级加载，或故意只做弱加载；
5. 如何计算带阻力、重力和离散刻顺序的轨迹；
6. 如何避免 TNT 峰值、珍珠碰撞扫描和新区块生成拖死服务器。

按本文框架，公开资料中的主线可概括为：

| 阶段 | 时间 | 能力跃迁 | 代表资料 |
| --- | --- | --- | --- |
| 前史 | 2017 年以前 | 珍珠发射、TNT 推进、远程加载分别被探索 | Xcom6000 的 [History of Pearl Cannons](https://www.youtube.com/watch?v=t61qa7EPlH4) |
| 定向 FTL | 2017 | 把远程珍珠运输组织成完整工程 | Xcom6000 的 [Faster Than Light](https://www.youtube.com/watch?v=_eOIVPQYOt8) |
| 环形与矢量化 | 2019 | 由固定方向走向 360 度可调向量 | Rechenmaschine 的 [Circular Pearl Cannon](https://www.youtube.com/watch?v=L3GuuUxJCGE)、Xcom6000 的 [360 FTL](https://www.bilibili.com/video/BV1Db41147dU) |
| 跨版本与重型工程化 | 2019-2020 | 1.13.2 重构、高精度阵列、缓存、计算器 | [Fallen_Breath 1.13.2 矢量炮](https://www.bilibili.com/video/BV154411M7Aa)、[360FTL-HEAVY](https://www.bilibili.com/video/BV1NC4y1x7WW) |
| 弱加载蓄力 | 2020-2023 | 冻结位移、反复叠加动量、再释放 | [弱加载珍珠炮](https://www.bilibili.com/video/BV1ef4y1v7Vp)、[LAZY 360 FTL](https://www.youtube.com/watch?v=atT_SbJulDE) |
| 1.21.2 后的新体系 | 2024-2026 | 绕过珍珠自加载票，高空抛射、空爆、接力与小型化 | [官方 1.21.2 说明](https://www.minecraft.net/en-us/article/minecraft-java-edition-1-21-2)、[360FTL-ELEVATE](https://www.bilibili.com/video/BV1H4Fcz9EiT) |

“FTL”是项目命名和社区习惯，不表示游戏真的模拟了超光速。端到端耗时仍由蓄力、珍珠飞行、区块生成、服务器掉刻和最终碰撞共同决定。

## 一、底层机制

### 1. 珍珠每游戏刻怎样运动

Fallen_Breath 为 360FTL-HEAVY 编写的 [PearlCannonHelper `Pearl.cpp`](https://github.com/Fallen-Breath/PearlCannonHelper/blob/360FTL-HEAVY/PearlCannonHelper/Pearl.cpp) 直接给出了当时设计使用的离散模拟顺序：

```cpp
position += momentum;
momentum *= 0.99;
momentum.y -= 0.03;
```

也就是先按当前速度移动，再施加 0.99 的阻力，最后在 Y 轴减去 0.03。写成向量形式：

$$
\mathbf p_{t+1}=\mathbf p_t+\mathbf v_t
$$

$$
\mathbf v_{t+1}=0.99\mathbf v_t+(0,-0.03,0)
$$

若中途没有碰撞或额外爆炸，水平轴可写成：

$$
v_x(n)=0.99^n v_x(0),\qquad
x(n)=x(0)+100v_x(0)(1-0.99^n)
$$

竖直速度则为：

$$
v_y(n)=0.99^n(v_y(0)+3)-3
$$

这解释了为什么珍珠炮计算器不能简单套用连续抛物线：游戏按离散刻更新，阻力会持续衰减速度，碰撞和区块边界又发生在特定的刻顺序中。

上述代码和常数是 360FTL-HEAVY 对目标版本的实现依据，不应被当作所有历史版本、服务端核心和炮口几何都不变的“万能配置”。

### 2. TNT 怎样变成方向可控的推力

爆炸会根据爆心到实体的位置、距离和遮挡给实体施加冲量。炮口先把珍珠归正到确定位置，再让大量 TNT 在确定位置同时或按时序爆炸，于是每组阵列都近似成为一个可重复的推力源。

矢量炮并不需要真的旋转整座机器。以左右两组推力为例，火控选择数量 $N_L$、$N_R$，再由象限线路改变方向符号：

$$
\Delta \mathbf v=N_L\mathbf a_L+N_R\mathbf a_R
$$

只要两组基向量不共线，改变两边的整数药量就能得到扇区内一组离散向量；1 TNT 步进使可选角度足够密，切换象限后可近似覆盖 360 度。真正困难的是让每个“1 TNT”增量、爆点、归中位置和时序都足够稳定。

[PearlCannonHelper 的 `Setting.cpp`](https://github.com/Fallen-Breath/PearlCannonHelper/blob/360FTL-HEAVY/PearlCannonHelper/Setting.cpp) 反映了 Heavy 的工程做法：27 位配置同时编码左右药量、方向和俯仰模式。每侧组合 260 TNT 大阵列、10 TNT 粗调和 1 TNT 细调，单侧上限 1820，总上限 3640，并保留 1 TNT 的步进。其独立阵列说明给出的关系是：

$$
N=10a+b,\qquad 0\le a\le25,\quad 0\le b\le10
$$

这里的“每 TNT 推力”依赖炮口几何和珍珠初态。Helper 中的推力常数是针对 Heavy 标定的，不应直接复制到另一座炮。

### 3. 强加载与弱加载为什么都能造炮

Java 版区块票使用数字等级表示加载类型，数字越小，加载能力越强。按 [Minecraft Wiki 的区块加载表](https://minecraft.wiki/w/Chunk#Level_and_load_type)：

| 等级 | 加载类型 | 与珍珠炮相关的性质 |
| --- | --- | --- |
| 31 及以下 | Entity Ticking | 实体正常处理，珍珠会移动、受重力并检测碰撞 |
| 32 | Block Ticking | 实体仍可被访问，但不被正常处理，俗称 lazy chunk/弱加载区块 |
| 33 | Border | 方块和实体可被检测或修改，但通常游戏过程不可用 |
| 34 及以上 | Inaccessible | 不可访问或已经进入卸载流程 |

普通强加载炮让珍珠从头到尾正常 tick，所有推力几乎必须在发射阶段一次准备好。弱加载炮则利用 32 级区块的差异：

1. 把珍珠送进仅弱加载的区块，使它停止自行移动；
2. 让相邻正常处理区域中的爆炸仍能访问珍珠并修改其动量；
3. 多轮爆炸反复叠加速度，而珍珠位置基本保持不变；
4. 完成蓄力后恢复实体刻或把珍珠送出弱加载区，累积动量一次释放。

弱加载不是“区块完全卸载”。完全卸载后爆炸无法稳定访问珍珠；加载过强又会让珍珠立刻飞走。它本质上是在精确控制**实体是否 tick**。

### 4. 为什么现代设计喜欢高空抛射和空爆

大当量设计的主要危险不是平均 MSPT，而是某一刻的峰值。公开设计说明反复提到两类成本：大量 TNT 同刻爆炸的射线/实体计算，以及高速珍珠进入地形高度后进行碰撞扫描和新区块加载。

现代炮常把珍珠送到该维度地形或建筑活动区之上再释放。部分下界设计把这一阶段写作 `Y=256+`，但这个数值与维度和版本有关，不是通用建筑高度。高空方案有三种收益：

1. 避开地形和服务器建筑，降低提前碰撞概率；
2. 在高处补充正 Y 动量，以抛射换取更远水平射程；
3. 控制珍珠重新落回地形高度时的水平速度，避免过快造成碰撞扫描峰值，也避免过慢导致飞行时间过长。

因此“更多 TNT”并不自动等于“更好的炮”。阵列频率、单次当量、爆点、飞行时长、峰值卡顿和维护成本必须一起权衡。

## 二、从定向炮到矢量炮

### 0. 前史：零散机制逐渐合流

Xcom6000 在 2017 年发布的 [History of Pearl Cannons](https://www.youtube.com/watch?v=t61qa7EPlH4) 回顾了 SethBling、Panda4994、test137E29 等人的早期实验，内容涉及珍珠发射、TNT/矿车炮、远程投掷与区块加载。这些工作分别证明了“珍珠可以被外力推进”和“远处珍珠可以继续存在或被加载”，但还不能据此断言某一人单独发明了后来所有模块。

因此，较稳妥的说法是：这些实验构成了珍珠炮的技术前史；当前能清楚追踪项目、说明和后继关系的工程主线，从 Xcom6000 的 FTL 系列开始。

### 1. 2017：定向 FTL 成为完整工程

Xcom6000 于 2017-11-30 发布 [Faster Than Light](https://www.youtube.com/watch?v=_eOIVPQYOt8)，将珍珠推进、发射时序和远程传送组织成一套可下载、可讲解的系统。它的重要性不只是射程，而是让后续作者有了一套可以重构的基准。

这类早期 FTL 仍以预设方向和既定炮体为核心。改变目的地通常意味着改变药量、角度、线路乃至结构，离“输入任意坐标后自动求解”还有距离。

### 2. 2019：Circular 架构与 360 FTL

Rechenmaschine 的 [Circular Pearl Cannon](https://www.youtube.com/watch?v=L3GuuUxJCGE) 把多个方向推力组织成环形/矢量结构。Xcom6000 随后在 2019-03-24 发布 [360 FTL](https://www.bilibili.com/video/BV1Db41147dU)，视频说明明确写明受到 Rechenmaschine 启发，并公开感谢：

| 参与者 | 公开说明中的具体工作 |
| --- | --- |
| Rechenmaschine | Circular/矢量架构来源 |
| Xcom6000 | 360 FTL 的系统设计、说明与整合 |
| RedCMD | 红石协助 |
| Kayleigh | 无延时比较器导线 |
| ornariece | 命令方块代码 |

这一阶段确立了后来矢量炮的核心范式：用若干可计量推力源合成方向，以面板和编码器代替整炮机械旋转。

### 3. 2019：Fallen_Breath 完成 1.13.2 重构

2019-06-05，Fallen_Breath 发布 [1.13.2 矢量珍珠炮](https://www.bilibili.com/video/BV154411M7Aa)。其简介对归属写得很清楚：矢量架构概念来自 Rechenmaschine，Xcom6000 提供了大量细节考究，智乃复刻了珍珠校正模块。

这项工作的关键价值是**跨版本重构和工程落地**，而不是重新宣称发明矢量概念。作者当时给出的设计数据为常规约 10 km，调整时序后可到约 44 km；这应理解为该炮在指定条件下的说明，不是所有 1.13+ 珍珠炮的统一上限。

视频还记录了当时的重要版本风险：自动保存可能使飞行中的珍珠在重新加载后丢失速度；1.14 的部分红石和区块加载变化也需要改造。这说明珍珠炮从一开始就是强版本绑定机械。

## 三、2020：420 FTL 与 Heavy 的工程化分叉

2020 年前后出现了两条相互参考、面向不同版本的重型路线。

### Xcom6000 与 `_gpw_`：420 FTL

[420 FTL](https://www.bilibili.com/video/BV1zi4y1879T) 是 Xcom6000 与 `_gpw_` 对 360 FTL 的重新设计，目标版本为 1.12.2 及以前。公开说明把整体共同设计归于二人，并指向 `_gpw_` 的 [TNT 复制与压缩阵列](https://www.bilibili.com/video/BV1zJ411a7PF)。后者把“复制推进药”和“把大量 TNT 归正到同一爆点”进一步模块化，也记录了坐标跨越二次幂边界时浮点精度可能破坏归中的历史问题。

### Fallen_Breath 与星空花夜丶：360FTL-HEAVY

同在 2020-04-20 公开的 [360FTL-HEAVY](https://www.bilibili.com/video/BV1NC4y1x7WW) 面向 Java 1.13.2，具备以下特征：

| 能力 | 公开参数或实现 |
| --- | --- |
| 最大推进药 | 3640 TNT，左右各 1820 |
| 药量精度 | 1 TNT 步进 |
| 阵列 | 260/10/1 TNT 分级组合 |
| 多人能力 | 可调角珍珠缓存，一炮携带多颗珍珠 |
| 火控 | 27 位配置 |
| 外部工具 | 路径模拟与目标坐标配置生成器 |

这里也应细分贡献：`_gpw_` 的 1.12 TNT 压缩思路是阵列来源之一；星空花夜丶制作了 1.13+ 防刷怪 260 TNT 阵列原型，并在缓存原型上加入可变角；Fallen_Breath 重新设计阵列布线、完成系统整合，并发布 [260 TNT 高精度阵列](https://www.bilibili.com/video/BV1et4y127MA) 和计算器源码。

[珍珠缓存原型视频](https://www.bilibili.com/video/BV1ZE411K7hS) 则说明，Fallen_Breath 提出用高频活塞反复推动珍珠、使多颗珍珠归中到同一点，星空花夜丶实现原型。缓存的意义是把“每次只能接收一位玩家的投掷”变成可排队、可批量发射的交通设施。

Heavy 的影响并非只有当量。它把珍珠炮拆成了可单独测量和替换的阵列、校正、缓存、编码、加载与计算器模块，形成了更接近大型生电设施的工程流程。

## 四、2020-2023：弱加载蓄力成为新路线

星空花夜丶在 2020-11 发布的 [关于弱加载珍珠炮](https://www.bilibili.com/video/BV1ef4y1v7Vp)，以及 2021 年的 [稳定性更高的弱加载珍珠炮](https://www.bilibili.com/video/BV1F54y1n7it)，展示了这条路线的实用化。作者当时把它定位为长距离返程方案，并认为短距离普通炮往往更直接；具体的 2 km、3 km 分界只是当时炮型和服务器条件下的经验值。

弱加载路线改变了设计目标：强加载炮追求一次性提供完整初速度，弱加载炮追求在珍珠被冻结时以较小阵列持续蓄力。它可以降低单次阵列规模，却引入了更复杂的加载边界、释放时序和误加载风险。

2022 年，MMADU 发布 [LAZY 360 FTL](https://www.youtube.com/watch?v=atT_SbJulDE)，把弱加载蓄力与 360 度矢量炮结合。原说明注明主要受 A1306 的 360 Void Cannon 启发，并感谢 intricate 展示 lazy aligner 概念。2023 年的 [生存实装弱加载边境炮](https://www.bilibili.com/video/BV1Fs4y1U7Yk) 则表明该路线已经从原理机进入大型服务器交通实践。

## 五、1.21.2：珍珠自加载带来的断点

24w37a 开始、正式进入 Java 1.21.2 的变化是：投出的末影珍珠会主动加载并 tick 所在区块。[Mojang 的正式更新说明](https://www.minecraft.net/en-us/article/minecraft-java-edition-1-21-2) 还指出，投掷者下线时珍珠会卸载，重新上线时恢复。

按当前 [Ender Pearl 条目](https://minecraft.wiki/w/Ender_Pearl#Chunk_loading) 的实现描述：

1. 珍珠所在区块获得 31 级票并正常处理实体；
2. 向外第一圈传播为 32 级 block ticking；
3. 再外一圈为 33 级 border，合计形成以珍珠为中心的 5×5 加载范围；
4. 珍珠进入新区块时创建票，并约每 39 gt 刷新一次；
5. 只有投掷者在线时，这套加载才持续存在。

这会直接破坏旧弱加载炮：珍珠自己把所在块提升到实体刻，就不再“冻结”。高版本方案的关键不是删除新机制，而是利用它的刷新条件：

1. 外部加载器先把目标块维持在 32 级；
2. 用活塞和碰撞结构把珍珠越过区块边界，而不是让珍珠靠自身 tick 飞过去；
3. 珍珠进入弱加载块后不再 tick，因此不会在新块创建或刷新自己的票；
4. 旧珍珠票约两秒后过期，外部加载器留下的 32 级状态接管；
5. 再按旧思路蓄力和释放。

[1.21.2+ 珍珠加载票讲解](https://www.bilibili.com/video/BV1TTf5YrEQr) 和 [高版本弱加载演示](https://www.bilibili.com/video/BV1zsbZzpE2c) 都围绕这一窗口展开。由于 1.21.2、1.21.5 等小版本还修改过实体、细雪和地狱门判定，写着“1.21+”的投影也不能默认跨小版本直用。

## 六、2025-2026：高空、空爆、接力与小型化

这一时期没有一台公认的“唯一下一代”，而是出现了多条并行优化方向。

### 1. 高速边境角点炮

Sea_Of_StarS丶在 2025-11 发布的 [高版本弱加载边境角点炮](https://www.bilibili.com/video/BV1pikXBoEs9)，把目标收敛为四个边境角点。设计先消除 X/Z 初始动量，在弱加载炮口蓄力，再消除蓄力产生的 Y 动量，最后补充新的向上速度并从高空抛射。

作者没有追求理论最短飞行时间，因为珍珠以过高水平速度落回地形高度会造成大量 raycast 和新区块加载，可能触发看门狗。这个取舍很能代表现代设计：目标函数已经从“最大速度”变成“现实耗时、峰值卡顿和可靠性的折中”。视频 credits 还明确列出 JustDoItWE、VividVoive_、Bot_NNNB、Rs_Server 和开w在阵列归中、炮口、校准与计数器方面的来源。

### 2. 360FTL-NEBULA：实验型重空爆

[360FTL-NEBULA](https://www.bilibili.com/video/BV17JUuB3EkE) 使用约 20,000 TNT，定位就是实验型重空爆矢量炮。作者特别强调它有生存实装参考意义，但不适合不加修改地推广；峰值风险来自爆炸瞬间和高速珍珠扫描，而不是平均 MSPT。

其公开 credits 包括 Rs_Server 的高版本珍珠校准原型、Miner-qn-5 的移位寄存器火控思路、JustDoItWE 的阵列协作与轨迹控制炮思路，以及 EmirAleph、Intricate 的 micro bud TNT 复制思路。它适合作为高当量研究样本，不适合作为普通服务器的默认选型。

### 3. 360FTL-ELEVATE：全图弱加载矢量炮

Sea_Of_StarS丶在 2026-02 发布的 [360FTL-ELEVATE](https://www.bilibili.com/video/BV1H4Fcz9EiT) 面向 1.21.2+，提供 12、24、48 gt 三档蓄力周期，并以自动调节珍珠 Y 速度的模块覆盖边境内目标。其设计目标是让珍珠从高空落回活动高度时保持可接受的水平速度区间，在飞行时间和 raycast 峰值之间取平衡。

该项目也展示了现代珍珠炮的协作规模：公开 credits 涵盖 CANGLUOCZ、开w、Jan0017、haohandy、Bot_NNNB、Bot_City、JustDoItWE、水星嗷、nyxon，以及参与跨版本调试的作者和服务器。这里的贡献均应限定在视频列出的具体模块，不能扩写成对整个技术路线的独占发明。

### 4. 强加载客户端与弱加载服务器

圣天为服务器设计的 [接力珍珠炮](https://www.bilibili.com/video/BV1nmQABzEX5) 于 2026-04 公开，其[技术说明](https://www.bilibili.com/opus/1189653065660104707)把两台炮比作“客户端”和“服务器”：

| 角色 | 职责 |
| --- | --- |
| 强加载炮/客户端 | 靠近玩家入口，快速编码并把珍珠送入交通网络 |
| 弱加载炮/服务器 | 远离常用区域，提供长距离蓄力和高空释放服务 |

两者通过加载线和时序信号衔接。弱加载部分故障时，强加载炮仍可保持自身功能；未来还能增加多个入口或多个弱加载服务节点。它的创新重点不是更大当量，而是把单体机器提升为可扩展的交通系统架构。

### 5. 小型化与双模式

QQDT1794 与 haohandy 的 [1600 TNT 小型矢量珍珠炮](https://www.bilibili.com/video/BV1ArvaBEEkh) 表明矢量炮也在向更低实装成本发展。2026-07 的 [双模式空爆珍珠炮](https://www.bilibili.com/video/BV1wggC6QEQv) 则在同一系统中提供常规与空爆模式，并公开列出阵列、打角器、炮口和计数器的来源。这些设计不一定重新定义底层原理，但代表了维护性、模式切换和社区模块复用的成熟。

### 6. 风弹推进：TNT 之外的并行分支

mor_doc 的 [Breeze360FTL MK II](https://github.com/mor-doc/Breeze360FTL_MKII) 使用 Breeze 产生的风弹而非 TNT 推进。其公开仓库包含 Litematica 投影和 Python 弹道计算器，特征是任意水平角、半自动、无需 TNT 复制；代价是需要 Breeze 与精细风弹堆叠，只支持主世界，且仍需手动微调。仓库记录的测试范围为 Vanilla/Fabric 1.21.8-1.21.11 和本地 Paper 1.21.8。

它更适合被视为新兴替代推进路线，而不是传统 TNT 弱加载炮的直接“下一代”。当服务器禁止 TNT 复制时，这类方案尤其值得关注。

## 七、一台现代珍珠炮有哪些模块

| 模块 | 作用 | 典型迭代 |
| --- | --- | --- |
| 投入与缓存 | 接收一颗或多颗玩家珍珠 | 单人投掷口 → 高频活塞归中 → 可变角多人缓存 |
| 初态校正 | 固定珍珠的亚方块位置和初始动量 | 方块碰撞校正 → 活塞反复归中 → 高速/向下校正 |
| 推进药源 | 提供可重复爆炸实体 | 手填 TNT → TNT 复制阵列 → micro bud 阵列；或风弹生成器 |
| TNT 压缩/归中 | 把大量 TNT 收束到稳定爆点 | 单阵列直爆 → 推进药推动发射药 → 防刷怪高密阵列 |
| 药量选择 | 控制冲量大小 | 固定当量 → 粗调 → 260/10/1 分级与 1 TNT 步进 |
| 矢量合成 | 控制水平方向 | 固定轴向 → 环形炮口 → 左右基向量与象限编码 |
| 俯仰/Y 动量 | 控制飞行高度与时间 | 固定平射 → 两档俯仰 → 消 Y、补 Y、自动调 Y |
| 区块管理 | 决定珍珠、阵列和线路是否 tick | 玩家加载 → 地狱门加载线 → 32 级弱加载 → 1.21.2 票过期窗口 |
| 火控与编码 | 把目标转换成阵列状态和时序 | 手动面板 → 比较器/时差编码 → 二进制、串行、移位寄存器 |
| 弹道计算 | 从坐标反求药量、方向和飞行刻数 | 查表 → Java/C++ 工具 → 可配置现代计算器 |
| 释放与落点 | 在正确时刻恢复移动并触发传送 | 直接射出 → 飞行器高空释放 → 抛射/空爆/接力 |
| 联锁与监控 | 防误操作、炸膛和超时 | 人工流程 → 回锁和互斥时序 → 峰值测试与看门狗预算 |

实际移植时，最容易被低估的是初态校正和区块管理。只复制外观相同的 TNT 阵列，而没有复制坐标对齐、朝向、加载范围和刻时序，通常不会得到相同轨迹。

## 八、版本与服务端兼容

### 原版版本断点

| 版本范围 | 可参考路线 | 不能直接忽略的问题 |
| --- | --- | --- |
| 1.12.2 及以前 | Xcom6000 360/420 FTL、`_gpw_` 阵列 | 老红石、老区块加载和浮点位置性；不能原样搬到 1.13+ |
| 1.13.2 | Fallen_Breath 矢量炮、360FTL-HEAVY | 自动保存、珍珠重载、绊线和加载器均与后续版本存在差异 |
| 1.16.5+ 的旧高版本段 | LAZY 360 FTL 等弱加载路线 | “+”不代表覆盖到 1.21.2；必须按具体投影说明测试 |
| 1.21.2-1.21.4 | 新珍珠自加载机制 | 弱加载需等待珍珠票过期；公开设计还报告过珍珠异常卸载 |
| 1.21.5 | 高版本炮的额外断点 | 地狱门判定等变化可能使某一版投影失效 |
| 1.21.6+ | 可使用失水恶魂等新碰撞/校正材料 | 新方块不是向下兼容；旧版本需要替代校正结构 |

作者写的兼容范围只证明其测试范围，不证明所有服务端、模组组合和坐标都可用。旋转、镜像、跨区块平移、改变视距或换维度也可能改变时序和归中。

### Paper 不是简单的“能用”或“不能用”

Paper 的行为取决于版本和配置。按当前官方文档，至少要逐项检查：

| 配置 | 当前默认值 | 对珍珠炮的影响 |
| --- | --- | --- |
| `unsupported-settings.allow-piston-duplication` | `false` | 默认禁止活塞式 TNT 复制，传统阵列无法供药 |
| `max-tnt-per-tick` | `100` | 超限的已点燃 TNT 会在当刻跳过 tick，熔丝也不递减，随后再处理；这会把原本同刻的爆炸拆到多刻并改变冲量时序。`0` 或负数表示不限制 |
| `environment.optimize-explosions` | `false` | 开启后改变爆炸实体查询的性能路径，必须重新做峰值和轨迹测试 |
| `fixes.disable-unloaded-chunk-enderpearl-exploit` | `false` | 仅在 `legacy-ender-pearl-behavior=true` 时生效；两项同时开启会在旧式珍珠停止 tick 或重新载入时清除 owner，可能破坏远程传送 |
| `misc.legacy-ender-pearl-behavior` | `false` | 开启后恢复 1.21.2 前的珍珠保存/加载方式，不再由珍珠加载区块；保持默认值时，上述 unloaded-chunk 修复项单独开启无效 |
| `misc.redstone-implementation` | `VANILLA` | EigenCraft 或 Alternate Current 会改变红石粉行为，原版时序不能照搬 |

对应来源是 Paper 的 [全局配置](https://docs.papermc.io/paper/reference/global-configuration/)、[世界配置](https://docs.papermc.io/paper/reference/world-configuration/) 和 [`spigot.yml`](https://docs.papermc.io/paper/reference/spigot-configuration/)。此外，反作弊、实体限速、区块预生成、异步区块插件、Carpet 规则、Lithium/TNT 优化和看门狗都可能改变结果。

因此，Paper 上正确的结论只能是“这套炮在某个精确版本、配置和插件集合下通过了测试”。mor_doc 的风弹 MK II 确实记录了本地 Paper 1.21.8 测试，但这不能替其他 TNT/弱加载设计背书。

## 九、贡献者与归属

珍珠炮是典型的模块化协作技术。下面只归纳公开简介能够支持的贡献，不把搬运、复刻、整合和原创混写：

| 人物/团队 | 可核实贡献 |
| --- | --- |
| SethBling、Panda4994、test137E29 等 | 早期珍珠传送、发射与远程区块加载实验；属于技术前史 |
| Xcom6000 | 2017 FTL 工程与历史整理；整合 360 FTL；与 `_gpw_` 重设计 420 FTL |
| Rechenmaschine | Circular Pearl Cannon 与后续矢量架构的明确灵感来源 |
| RedCMD、Kayleigh、ornariece | 360 FTL 中分别提供红石、无延时比较器导线和命令代码协助 |
| `_gpw_` | TNT 复制/压缩阵列；与 Xcom6000 共同设计 420 FTL 及前序版本 |
| Fallen_Breath | 1.13.2 矢量炮重构；Heavy 系统、阵列布线、火控、轨迹模拟器；提出高频活塞归中缓存办法 |
| 星空花夜丶 | 1.13+ 防刷怪 260 TNT 原型、可变角珍珠缓存原型；早期实用弱加载炮与稳定化讲解 |
| 智乃 | Fallen_Breath 1.13.2 项目中的珍珠校正模块复刻 |
| A1306、intricate、MMADU | Void Cannon/lazy aligner 思路及 LAZY 360 FTL 的整合发展 |
| Sea_Of_StarS丶及其公开 credits 协作者 | 高版本边境抛射、NEBULA 重空爆、ELEVATE 全图弱加载矢量炮及跨版本调试 |
| 圣天 | 强加载客户端与弱加载服务器的接力交通架构、时序与稳定性设计 |
| QQDT1794、haohandy | 1.21.2+ 1600 TNT 小型矢量炮 |
| mor_doc | Breeze 风弹半自动 360 度珍珠炮及开源计算器 |

引用具体机器时，最好继续查看原视频简介和存档内 credits。诸如“阵列原型”“布线重构”“炮口思路”“计算器”“生存施工”都是不同类型的贡献，不能因为最后成片由一个账号发布就全部归给发布者。

## 十、选型与实装检查表

### 如何选路线

| 需求 | 更合理的起点 |
| --- | --- |
| 固定站点到固定站点、距离不极端 | 定向强加载炮，结构和维护成本最低 |
| 任意方向、常用坐标交通 | 常规矢量炮加计算器 |
| 极远距离或世界边境 | 弱加载蓄力炮；固定角点需求可省去完整矢量火控 |
| 多人同时出发 | 带珍珠缓存的炮型 |
| 需要跨多个入口和远端炮口 | 接力/客户端-服务器架构 |
| 服务器禁止 TNT 复制 | 风弹分支，或放弃原版自动珍珠炮 |
| 只追求展示性极限当量 | 实验型空爆炮；不要直接作为生存服默认方案 |

### 开工前必须确认

1. 锁定 Minecraft、Fabric/Paper、模组和插件的完整版本号；
2. 确认服务器规则允许 TNT 复制、弱加载和远程珍珠；
3. 用副本世界验证投影朝向、区块对齐、旋转与镜像限制；
4. 分别测试珍珠校正、每档阵列、加载线和释放器，不要第一次就满当量联调；
5. 核对视距、模拟距离、地狱门加载器和投掷者在线状态；
6. 预生成预计航线，单独记录首次飞行与后续飞行耗时；
7. 同时监控平均 MSPT、最坏单刻耗时、内存和看门狗，而不是只看 TPS；
8. 在目标实际坐标测试浮点位置性、区块边界和周边建筑碰撞；
9. 检查自动保存、重启、玩家下线和跨维度后的珍珠所有者关系；
10. 保留世界备份、急停、互斥锁和低当量测试档，再开放给普通玩家。

## 结语

珍珠炮的发展不是单纯把 100 TNT 堆到 20,000 TNT，而是不断把不可控因素变成模块和参数：先控制方向，再控制 1 TNT 的药量，再冻结实体刻以累积动量，最后控制珍珠自加载票、高空速度和服务器峰值。

Fallen_Breath 的关键位置也正在这里：他不是 Circular/矢量概念的原始提出者，却完成了 1.13.2 迁移，把阵列、缓存、火控和弹道工具工程化，并与星空花夜丶等人的模块共同构成中文技术社区的重要节点。同理，现代高版本设计也不是凭空出现，而是在 Xcom6000、Rechenmaschine、`_gpw_`、弱加载研究者和大量模块作者的公开成果上继续收敛稳定性与实装成本。

如果要用一句话描述 2026 年的珍珠炮，它已经不再只是一门“炮”，而是一套由实体物理、区块票、爆炸阵列、数字火控和服务器性能预算共同构成的远程传送系统。

## 主要资料

### 官方机制与源码

- [Minecraft Java Edition 1.21.2 更新说明](https://www.minecraft.net/en-us/article/minecraft-java-edition-1-21-2)
- [Minecraft Snapshot 24w37a](https://www.minecraft.net/en-us/article/minecraft-snapshot-24w37a)
- [Minecraft Wiki：Ender Pearl](https://minecraft.wiki/w/Ender_Pearl)
- [Minecraft Wiki：Chunk](https://minecraft.wiki/w/Chunk)
- [Fallen_Breath/PearlCannonHelper，360FTL-HEAVY 分支](https://github.com/Fallen-Breath/PearlCannonHelper/tree/360FTL-HEAVY)
- [Paper 全局配置](https://docs.papermc.io/paper/reference/global-configuration/)
- [Paper 世界配置](https://docs.papermc.io/paper/reference/world-configuration/)
- [Paper 的 spigot.yml 配置](https://docs.papermc.io/paper/reference/spigot-configuration/)

### 历史主线

- [Xcom6000：History of Pearl Cannons](https://www.youtube.com/watch?v=t61qa7EPlH4)，[中文字幕搬运](https://www.bilibili.com/video/BV13v411q777)
- [Xcom6000：Faster Than Light](https://www.youtube.com/watch?v=_eOIVPQYOt8)，[中文字幕搬运](https://www.bilibili.com/video/BV1MW411b7sv)
- [Rechenmaschine：Circular Pearl Cannon](https://www.youtube.com/watch?v=L3GuuUxJCGE)
- [Xcom6000：360 FTL](https://www.bilibili.com/video/BV1Db41147dU)
- [Fallen_Breath：1.13.2 矢量珍珠炮](https://www.bilibili.com/video/BV154411M7Aa)
- [Xcom6000：420 FTL](https://www.youtube.com/watch?v=rIRTeVUhFGs)，[中文字幕搬运](https://www.bilibili.com/video/BV1zi4y1879T)
- [`_gpw_`：TNT 复制与压缩阵列](https://www.bilibili.com/video/BV1zJ411a7PF)
- [Fallen_Breath 与星空花夜丶：360FTL-HEAVY](https://www.bilibili.com/video/BV1NC4y1x7WW)
- [Fallen_Breath：260 TNT 高精度阵列](https://www.bilibili.com/video/BV1et4y127MA)
- [星空花夜丶：珍珠缓存](https://www.bilibili.com/video/BV1ZE411K7hS)

### 弱加载与现代分支

- [星空花夜丶：关于弱加载珍珠炮](https://www.bilibili.com/video/BV1ef4y1v7Vp)
- [星空花夜丶：稳定性更高的弱加载珍珠炮](https://www.bilibili.com/video/BV1F54y1n7it)
- [MMADU：LAZY 360 FTL](https://www.youtube.com/watch?v=atT_SbJulDE)，[Bilibili 搬运](https://www.bilibili.com/video/BV1v8411x7f2)
- [生存实装弱加载边境炮](https://www.bilibili.com/video/BV1Fs4y1U7Yk)
- [1.21.2+ 珍珠加载票与弱加载讲解](https://www.bilibili.com/video/BV1TTf5YrEQr)
- [高版本珍珠炮如何使珍珠弱加载](https://www.bilibili.com/video/BV1zsbZzpE2c)
- [Sea_Of_StarS丶：高版本弱加载边境角点炮](https://www.bilibili.com/video/BV1pikXBoEs9)
- [Sea_Of_StarS丶：360FTL-NEBULA](https://www.bilibili.com/video/BV17JUuB3EkE)
- [Sea_Of_StarS丶：360FTL-ELEVATE](https://www.bilibili.com/video/BV1H4Fcz9EiT)
- [圣天：接力珍珠炮技术说明](https://www.bilibili.com/opus/1189653065660104707)
- [QQDT1794、haohandy：1600 TNT 小型矢量炮](https://www.bilibili.com/video/BV1ArvaBEEkh)
- [mor_doc：Breeze360FTL MK II](https://github.com/mor-doc/Breeze360FTL_MKII)
- [Corn_desu：双模式空爆珍珠炮](https://www.bilibili.com/video/BV1wggC6QEQv)
