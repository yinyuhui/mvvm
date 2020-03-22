# mvvm demo

这是一个简易的 mvvm demo, 主要是梳理了一下实现逻辑

采用数据劫持结合发布者-订阅者模式的方式
通过 Object.defineProperty() 劫持并监听各个属性的 setter 和 getter
在数据变动时，发布消息给依赖收集器，通知观察者，调用相应的回调函数，进而更新视图

MVVM 作为入口函数，整合 Observer、Compile、Watcher 三者
通过 Observer 监听数据变化
通过 Compile 解析编译模版指令
通过 Watcher 连接 Observer 和 Compile 
达到数据更新时视图更新，视图交互更新时数据更新的双向绑定效果
