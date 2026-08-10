# 定时器基本定时与计数原理

这部分学习使用 STM32F103C8T6 的 TIM4 完成基本定时。最初看到 PSC、ARR 和 CNT 时，它们像一组难记的缩写；真正按一次“每秒触发”的需求计算后，关系就清楚了许多。

## 定时器在做什么

定时器的核心是一个按照时钟脉冲递增或递减的计数器：

```text
TIMxCLK → PSC 预分频 → CNT 计数 → 到达 ARR → 更新事件
```

- `TIMxCLK` 是定时器实际使用的输入时钟
- `PSC` 决定输入时钟先被分频多少
- `CNT` 保存当前数到哪里
- `ARR` 决定这一轮计数在哪里结束

PSC 和 ARR 都按照“寄存器值 + 1”计算：

```text
计数频率 = TIMxCLK / (PSC + 1)

更新频率 = TIMxCLK / ((PSC + 1) × (ARR + 1))

更新周期 = (PSC + 1) × (ARR + 1) / TIMxCLK
```

## 用 TIM4 得到一秒

在常见的 F103 时钟配置下，APB1 定时器时钟为 72 MHz。把 TIM4 配置为：

```text
PSC = 7199
ARR = 9999
```

计算过程是：

```text
72 MHz / 7200 = 10 kHz
10 kHz / 10000 = 1 Hz
```

因此 TIM4 每秒产生一次更新事件。

## 从更新事件到中断回调

只调用 `HAL_TIM_Base_Start()` 会启动计数，但不会进入更新中断。要在周期到达时收到回调，需要开启 NVIC 并使用：

```c
HAL_TIM_Base_Start_IT(&htim4);
```

随后在回调里判断中断来源：

```c
volatile uint8_t oneSecondFlag = 0;

void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
    if (htim->Instance == TIM4)
    {
        oneSecondFlag = 1;
    }
}
```

更稳妥的做法是在中断里只设置标志，把串口发送等耗时任务放回主循环。这样可以减少中断回调中的阻塞与外设耦合。

## “启动后立刻回调”是怎么回事

初始化定时器时，HAL 可能主动产生更新事件，把 PSC 等配置装入实际工作的寄存器，同时提前将更新标志 `UIF` 置 1。之后一启用更新中断，CPU 就会立即响应这次遗留请求。

如果这次额外回调会影响逻辑，可以在初始化完成后、启动中断前清除标志：

```c
MX_TIM4_Init();
__HAL_TIM_CLEAR_FLAG(&htim4, TIM_FLAG_UPDATE);
HAL_TIM_Base_Start_IT(&htim4);
```

## 实践结果

这次练习已经通过 TIM4 更新中断让 USART2 每秒输出一次“1s 到了”，板端运行成功。

我从这里开始理解：所谓“定时一秒”并不是调用一个神秘的延时函数，而是先确认时钟来源，再让硬件按设定好的分频和计数次数，稳定地产生周期事件。
