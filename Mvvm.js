// 编译类 根据不同指令实现不同编译方法
const compileUtil = {
    // 渲染视图
    updater: {
        textUpdater(node, value) {
            // 不会解析HTML
            node.textContent = value
        },
        htmlUpdater(node, value) {
            // 内容中HTML会被解析
            node.innerHTML = value
        },
        modalUpdater(node, value) {
            // 用于表单的输入框
            node.value = value
        }
    },

    setVal(expression, vm, value) {
        let keys = expression.split('.')
        keys.reduce((data, key, currentIndex) => {
            if (currentIndex === keys.length - 1) {
                return (data[key] = value)
            }
            return data[key]
        }, vm.$data)
    },

    // 可能是 a.b.c 的形式，因此reduce取值
    getVal(expression, vm) {
        let keys = expression.split('.')
        return keys.reduce((data, key) => {
            return data[key]
        }, vm.$data)
    },

    // 可能是编译模版，可能是v-text，也可能是文本
    getContent(expression, vm) {
        let value
        // 先匹配编译模版 {{msg}}
        if (/\{\{(.+?)\}\}/g.test(expression)) {
            value = expression.replace(/\{\{(.+?)\}\}/g, (...args) => {
                return this.getVal(args[1], vm)
            })
        } else {
            // 可能是 v-text，如果没找到值就原样输出
            // 这里有点问题，falsy value 会输出 expression，要先判断一下 key 是否存在
            value = this.getVal(expression, vm) || expression
        }
        return value
    },

    // v-text {{}}
    text(node, expression, vm) {
        let value = this.getContent(expression, vm)
        // 绑定观察者 数据发生变化时  触发回调 更新视图
        new Watcher(vm, expression, _ => {
            this.updater.textUpdater(node, this.getContent(expression, vm))
        })
        this.updater.textUpdater(node, value)
    },

    // v-html
    html(node, expression, vm) {
        const value = this.getVal(expression, vm)
        new Watcher(vm, expression, newValue => {
            this.updater.htmlUpdater(node, newValue)
        })
        this.updater.htmlUpdater(node, value)
    },

    // v-modal
    modal(node, expression, vm) {
        const value = this.getVal(expression, vm)
        new Watcher(vm, expression, newValue => {
            this.updater.modalUpdater(node, newValue)
        })
        // 视图 => 数据 => 视图
        node.addEventListener('input', e => {
            this.setVal(expression, vm, e.target.value)
        })

        this.updater.modalUpdater(node, value)
    },

    // v-on:click v-on:change @click等
    on(node, expression, vm, event) {
        let fn = vm.$methods[expression]
        node.addEventListener(event, fn.bind(vm), false)
    },

    // v-bind:src 等
    bind(node, expression, vm, attr) {
        node.setAttribute(attr, expression)
    }
}

class Compile {
    constructor(el, vm) {
        // 如果传入的是个节点 直接赋值，否则获取相应节点赋值
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm

        // 获取文档碎片对象放入内存，减少页面回流和重绘
        const fragment = this.node2Fragment(this.el)

        // 编译模版
        this.compile(fragment)

        // 追加子元素到跟元素
        this.el.appendChild(fragment)
    }

    node2Fragment(el) {
        // 创建文档碎片
        const fragment = document.createDocumentFragment()
        let firstChild = el.firstChild
        // 获取所有节点
        while (firstChild) {
            fragment.appendChild(firstChild)
            firstChild = el.firstChild
        }
        return fragment
    }

    isElementNode(node) {
        return node.nodeType === 1
    }

    isDirective(name) {
        return name.startsWith('v-')
    }

    isEvent(name) {
        return name.startsWith('@')
    }

    compile(fragment) {
        // 获取子节点
        // node.children 子节点
        // node.childNodes 子节点及text
        const nodes = fragment.childNodes
        nodes.forEach(node => {
            if (this.isElementNode(node)) {
                // 是节点，编译该节点
                this.compileNode(node)
                // 如果该节点下还有子元素，递归编译
                if (node.childNodes && node.childNodes.length) {
                    this.compile(node)
                }
            } else {
                // 是文本，编译文本
                this.compileText(node)
            }
        })
    }

    compileNode(node) {
        // 获取所有属性，编译指令相关的属性
        const attrs = node.attributes
        for (let attr of attrs) {
            const { name, value } = attr
            if (this.isDirective(name)) {
                // 如果是指令，先处理以下，去掉前缀
                const [, directive] = name.split('-')
                // 可能有 v-on:click v-once:click v-bind:xx 这种指令，需分解拿到指令名和触发事件
                const [dirName, eventName] = directive.split(':')
                compileUtil[dirName](node, value, this.vm, eventName)

                // 清除标签上的指令属性
                node.removeAttribute(name)
            }
            if (this.isEvent(name)) {
                const [, eventName] = name.split('@')
                compileUtil.on(node, value, this.vm, eventName)
            }
        }
    }

    compileText(node) {
        let content = node.textContent
        content && compileUtil.text(node, content, this.vm)
    }
}

class Mvvm {
    constructor(props) {
        // 获取传入的内容
        this.$options = props
        this.$el = props.el
        this.$data = props.data || {}
        this.$methods = props.methods || {}
        // 传入了挂载节点
        if (this.$el) {
            // 实现observer
            new Observer(this.$data)
            // 实现compile
            new Compile(this.$el, this)
        }
    }
}
