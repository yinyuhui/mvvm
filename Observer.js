class Watcher {
    constructor(vm, expression, cb) {
        this.vm = vm
        this.expression = expression
        this.cb = cb
        this.oldVal = this.getOldVal()
    }
    getOldVal() {
        // 挂载 watcher
        Dep.target = this
        const oldVal = compileUtil.getContent(this.expression, this.vm)
        // 及时清除，否则会约积越多，翻倍增加
        Dep.target = null
        return oldVal
    }

    // 观察者收到更新
    update() {
        // 新旧值不相同时 更新旧值 执行回调 callback收到新值并进行视图更新
        const newVal = compileUtil.getContent(this.expression, this.vm)
        if (newVal !== this.oldVal) {
            this.oldVal = newVal
            this.cb(newVal)
        }
    }
}

// 收集依赖
class Dep {
    constructor() {
        // 观察者列表
        this.subs = []
    }

    // 添加观察者
    addSub(watcher) {
        this.subs.push(watcher)
    }

    // 订阅者接收到更新
    notify() {
        this.subs.forEach(sub => {
            // 通知观察者
            sub.update()
        })
    }
}

class Observer {
    constructor(data) {
        this.observe(data)
    }

    observe(data) {
        // 本代码只为了解数据劫持原理 因此简易实现 对象类型才会操作
        // 此处不考虑函数初始化data 多加一层判断即可
        // 也不考虑数组的情况（vue复写了常用方法）
        if (data && typeof data === 'object') {
            // 遍历每一个值
            let keys = Object.keys(data)
            keys.map(key => {
                this.defineReactive(data, key, data[key])
            })
        }
    }

    defineReactive(obj, key, value) {
        // 如果是有层级的对象 需要递归进行数据劫持
        this.observe(value)
        // 每个属性都初始化一个订阅器
        const dep = new Dep()
        // 数据劫持
        Object.defineProperty(obj, key, {
            enumerable: true, // 可遍历
            configurable: false, // 可编辑
            get() {
                // 订阅的数据变化时，向dep中添加观察者
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            // 避免this指向问题 使用箭头函数一层层向上查找this
            set: newValue => {
                // 值赋值成新的对象之后就没有劫持了，因此需在set时劫持一下
                this.observe(newValue)
                // 值不相同时更新
                if (newValue !== value) {
                    value = newValue
                }
                // 告诉 Dep 通知 Watcher 变化
                dep.notify()
            }
        })
    }
}
