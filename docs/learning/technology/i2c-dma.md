# I2C DMA：从中断模式继续迁移

这一篇记录的是在 I2C 中断状态机已经运行成功后，怎样继续迁移到 DMA 模式。CubeMX 配置和代码方法已经整理，但还没有完成实际编译、烧录与板端验证，因此目前保留为“待验证”。

## 核心变化

原有状态机和完成回调可以继续使用，主要变化有两处：

1. 为 I2C1 增加 RX 与 TX 的 DMA 请求
2. 把 `_IT` 接口替换为 `_DMA` 接口

```c
HAL_I2C_Master_Transmit_DMA(&hi2c1, AHT20_ADDRESS,
                            sendBuffer, 3);
HAL_I2C_Master_Receive_DMA(&hi2c1, AHT20_ADDRESS,
                           readBuffer, 6);
```

中断模式仍需要 CPU 响应通信过程中的事件；DMA 模式则由 DMA 控制器负责在 I2C 数据寄存器与内存缓冲区之间搬运字节，完成后再通知 CPU。

## CubeMX 配置思路

1. 为 I2C1 添加 RX 和 TX DMA
2. Mode 选择 Normal
3. 关闭 Peripheral Increment，开启 Memory Increment
4. 外设和内存的数据宽度都选择 Byte
5. 保留 I2C Event/Error 中断
6. 生成代码后确认 `MX_DMA_Init()` 在通信开始前调用

## 排错清单

- DMA 不启动：检查 RX/TX 请求、DMA 时钟和 `MX_DMA_Init()`
- 缓冲区异常：保证收发完成前缓冲区始终有效
- 没有完成回调：检查 DMA IRQ、I2C IRQ 和对应 HAL Handler
- 从 F103 迁移到 F407：DMA Stream 与 Channel 不同，必须重新通过 CubeMX 配置

AHT20 单次只收发 3 或 6 字节，DMA 未必会带来明显的性能收益。这一阶段更重要的意义，是理解 CPU、中断和 DMA 在数据传输中的分工差异。
