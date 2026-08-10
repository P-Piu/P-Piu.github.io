# I2C 中断与状态机

轮询模式跑通以后，我把 AHT20 的阻塞式 I2C 收发改成了 `_IT` 中断接口，并用状态机保证发送、等待、接收和解析按照正确顺序发生。这个版本已经实际烧录并运行成功。

## 为什么需要状态机

`HAL_I2C_Master_Transmit_IT()` 和 `HAL_I2C_Master_Receive_IT()` 只负责启动操作，随后立即返回。真正的完成时刻由回调通知，因此原先写在一个函数里的顺序流程，需要拆成多个状态：

```text
IDLE
→ TX_BUSY
→ WAIT_MEASURE
→ RX_BUSY
→ DATA_READY
→ IDLE
```

我在这里记住了一个很重要的细节：应当先把状态改为“忙碌”，再启动异步操作。否则操作很快完成时，回调可能已经推进了状态，主程序却又把它覆盖回旧值。

## 主循环与回调怎样分工

主循环根据当前状态决定下一步；完成回调只负责推进状态，不在中断里完成全部工作。

```c
if (aht20State == AHT20_IDLE) {
    aht20State = AHT20_TX_BUSY;
    AHT20_Measure();
} else if (aht20State == AHT20_WAIT_MEASURE) {
    HAL_Delay(75);
    aht20State = AHT20_RX_BUSY;
    AHT20_Get();
} else if (aht20State == AHT20_DATA_READY) {
    AHT20_Analysis(&temperature, &humidity);
    aht20State = AHT20_IDLE;
}

void HAL_I2C_MasterTxCpltCallback(I2C_HandleTypeDef *hi2c) {
    if (hi2c == &hi2c1) {
        aht20State = AHT20_WAIT_MEASURE;
    }
}
```

## 迁移步骤

1. 在 CubeMX 中开启 I2C1 Event/Error 中断
2. 把收发缓冲区改成静态生命周期
3. 将原来的读取函数拆分为 Measure、Get 和 Analysis
4. 定义枚举状态与 `volatile` 状态变量
5. 实现发送、接收完成回调
6. 在主循环中编写状态转换

## 排错记录

- 进不了回调：检查 NVIC、`I2C1_EV_IRQHandler()` 和 HAL IRQ Handler
- 状态一直停在 `TX_BUSY` 或 `RX_BUSY`：检查启动函数返回值与回调函数名
- 解析结果全零：确认只在接收完成后解析
- 整个流程只运行一次：数据处理后需要回到 `AHT20_IDLE`

这个版本虽然使用了中断，但等待测量的阶段仍然包含 `HAL_Delay(75)`，所以整个程序还不能算完全非阻塞。对我来说，它更像是理解“异步操作 + 状态推进”的第一步。
