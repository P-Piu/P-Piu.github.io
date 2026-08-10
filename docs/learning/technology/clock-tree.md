# STM32 时钟源与时钟树

这篇笔记来自我跟随 Keysking 教程学习 RCC 和时钟树的过程。当前练习使用的是 STM32F103C8T6，因此文中的 8 MHz HSE、72 MHz HCLK 和 APB 分频都对应 F103；换到其他芯片时，参数需要重新查阅手册和配置，不能直接照搬。

## 我先记住的结论

- RCC 负责复位与时钟控制
- HSE 是外部高速时钟源，学习板使用 8 MHz 晶振
- SYSCLK 是系统时钟，HCLK 是 SYSCLK 经过 AHB 预分频后得到的时钟
- STM32F103C8T6 常见的配置是 8 MHz HSE 经 PLL 倍频到 72 MHz
- CubeMX 可以帮助求解倍频与分频参数，但生成代码前仍要检查各级频率是否超限

一条最常见的时钟链路可以先写成：

```text
8 MHz HSE → PLL ×9 → 72 MHz SYSCLK
                         ↓ AHB Prescaler
                     72 MHz HCLK
                         ↓
                   APB1 / APB2
```

## 为什么不能只看 HCLK

单片机内部并不是所有模块都直接使用 HCLK。外设分布在 APB1、APB2 等不同总线上，各自还有预分频规则。

以 F103 的常见配置为例：

```text
HCLK  = 72 MHz
PCLK1 = 36 MHz
PCLK2 = 72 MHz
```

这里最容易弄错的是定时器时钟：当 APB 预分频大于 1 时，对应定时器时钟通常会自动变为 `2 × PCLK`。因此 PCLK1 虽然是 36 MHz，APB1 上的定时器仍可能以 72 MHz 计数。

这也意味着，在配置 UART、定时器、ADC 或 USB 前，不能只看最上方的 HCLK，还要顺着时钟树找到该外设真正使用的时钟。

## CubeMX 配置过程

1. 在 `System Core → RCC` 中，将 HSE 设置为 `Crystal/Ceramic Resonator`
2. 进入 `Clock Configuration`
3. 在 HCLK 输入目标频率并让 CubeMX 自动求解 PLL 与分频参数
4. 检查 SYSCLK、HCLK、PCLK1、PCLK2 是否超过芯片允许的上限
5. 确认界面没有红色错误后再生成代码

程序运行后，也可以读取 HAL 根据 RCC 寄存器配置计算出的频率：

```c
uint32_t sysclk = HAL_RCC_GetSysClockFreq();
uint32_t hclk   = HAL_RCC_GetHCLKFreq();
uint32_t pclk1  = HAL_RCC_GetPCLK1Freq();
uint32_t pclk2  = HAL_RCC_GetPCLK2Freq();
```

这些值适合辅助检查配置，但它们不能单独证明外部晶振已经在硬件上稳定工作。

## 这次学习中容易混淆的地方

- 晶体或陶瓷谐振器应选 `Crystal/Ceramic Resonator`；只有外部设备直接输入有源时钟时才选 Bypass
- CubeMX 出现红色标记通常表示某一级频率超限或时钟路径没有连通，不能直接忽略
- 定时器时钟不一定等于 PCLK；APB 预分频大于 1 时要考虑自动倍频
- ADC 时钟还会经过专用预分频，USB 则需要准确的 48 MHz 时钟
- F103 的配置结论不能直接复制给 F407 或其他系列

学完这一部分后，我对“72 MHz”终于不再只剩一个孤立的数字：它有来源，也会沿着不同总线继续分流，最终决定各个外设怎样工作。
