# 嵌入式

<div class="knowledge-outline">
  <div class="outline-heading">单片机基础</div>
  <div class="outline-body">
    <div class="outline-leaf is-pending">Arduino</div>
    <div class="outline-leaf is-pending">ESP32</div>
    <details class="outline-details">
      <summary>STM32</summary>
      <div class="outline-children">
        <details class="outline-details">
          <summary>基础原理</summary>
          <div class="outline-children">
            <a class="outline-link" href="../clock-tree/">时钟源与时钟树</a>
            <div class="outline-leaf is-pending">C 语言模块化与头文件</div>
          </div>
        </details>

        <details class="outline-details">
          <summary>定时器</summary>
          <div class="outline-children">
            <a class="outline-link" href="../timer-basics/">基本定时与计数原理</a>
            <a class="outline-link" href="../pwm-basics/">PWM 基础</a>
            <div class="outline-leaf is-pending">外部时钟</div>
            <div class="outline-leaf is-pending">从模式与主从同步</div>
            <div class="outline-leaf is-pending">输入捕获</div>
            <div class="outline-leaf is-pending">编码器模式</div>
          </div>
        </details>

        <details class="outline-details">
          <summary>通信协议</summary>
          <div class="outline-children">
            <div class="outline-leaf is-pending">UART</div>
            <details class="outline-details">
              <summary>I2C</summary>
              <div class="outline-children">
                <a class="outline-link" href="../i2c-polling-aht20/">轮询读取 AHT20</a>
                <a class="outline-link" href="../i2c-interrupt-state-machine/">中断与状态机</a>
                <a class="outline-link" href="../i2c-dma/">DMA 模式</a>
              </div>
            </details>
            <div class="outline-leaf is-pending">CAN</div>
            <div class="outline-leaf is-pending">SPI</div>
          </div>
        </details>

        <details class="outline-details">
          <summary>执行器与控制</summary>
          <div class="outline-children">
            <div class="outline-leaf is-pending">PWM 舵机</div>
            <div class="outline-leaf is-pending">PWM 直流电机</div>
            <div class="outline-leaf is-pending">编码器轮速测量</div>
            <div class="outline-leaf is-pending">PID 速度闭环</div>
          </div>
        </details>

        <div class="outline-leaf is-pending">FreeRTOS</div>
      </div>
    </details>
  </div>
</div>
