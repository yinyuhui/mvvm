# mvvm demo

这是一个简易的 mvvm demo, 主要是梳理了一下实现逻辑

采用数据劫持结合发布者-订阅者模式的方式

通过 Object.defineProperty() 劫持并监听各个属性的 setter 和 getter

在数据变动时，发布消息给依赖收集器，通知观察者，调用相应的回调函数，进而更新视图


MVVM 作为入口函数，整合 Observer、Compile、Watcher 三者

- 通过 Observer 监听数据变化
- 通过 Compile 解析编译模版指令
- 通过 Watcher 连接 Observer 和 Compile 

达到数据更新时视图更新，视图交互更新时数据更新的双向绑定效果

# 1、MVVM 响应式原理

## 1.1 双向绑定含义

双向绑定简单来说就是数据可以驱动视图，视图也可以影响数据。

视图修改数据无非就是通过监听可输入元素的变化，动态修改 `view` 和 `modal`

## 1.2 实现数据绑定方式

常用的有三种方式

+ 发布者-订阅者模式(backbone)
+ 脏值检查(angular)
+ 数据劫持(vue)

### 1.2.1 发布者-订阅者模式

sub、pub 方式实现数据和试图的绑定监听，`vm.set(property, value)` 方式更新数据

### 1.2.2 脏值检查

最简单实现方式定时器轮询是否发生变化

在指定事件触发时，检测新旧值是否相同，如果不同则更新

触发事件比如 

+ 用户交互 - 用户填写表单、点击按钮等
+ XHR响应 - ` http` 请求
+ 浏览器 `location` 变化 - 路由跳转
+ timer - 定时器

### 1.2.3 数据劫持

通过 `Object.defineProperty()` 劫持各属性的 `setter` 和 `getter`，发生变化时发布消息给订阅者，触发回调

## 1.3 vue 实现原理

Vue 采用数据劫持结合发布者-订阅者模式的方式通过 Object.defineProperty() 劫持并监听各个属性的 setter 和 getter，在数据变动时，发布消息给依赖收集器，通知观察者，调用相应的回调函数，进而更新视图

### 1.3.1 实现逻辑

MVVM 作为入口函数，整合 Observer、Compile、Watcher 三者，通过 Observer 监听数据变化，通过 Compile 解析编译模版指令，通过 Watcher 连接 Observer 和 Compile ，达到数据更新时视图更新，视图交互更新时数据更新的双向绑定效果



<img src="/Users/yuhui/Documents/学习笔记/images/MVVM流程.png" alt="MVVM流程" style="zoom:80%;" />

订阅器(dep)：通知订阅者更新视图，存放多个订阅器

订阅者(watcher)：更新视图

observer：劫持属性

compile：解析指令

### 1.3.2 代码实现

完成基础逻辑实现，仓库地址：

https://github.com/yinyuhui/mvvm















