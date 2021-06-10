### 路由注册
使用路由之前，需要调用 Vue.use(VueRouter)，这是因为让插件可以使用 Vue
```javascript
export function initUse(Vue: GlobalAPI) {
    Vue.use = function(plugin: Function | Object) {
        // 判断重复安装插件
        const installedPlugins =
        this._installedPlugins || (this._installedPlugins = [])
        if (installedPlugins.indexOf(plugin) > -1) {
            return this
        }
        const args = toArray(arguments, 1)
        // 插入 Vue
        args.unshift(this)
        // 一般插件都会有一个 install 函数
        // 通过该函数让插件可以使用 Vue
        if (typeof plugin.install === 'function') {
            plugin.install.apply(plugin, args)
        } else if (typeof plugin === 'function') {
            plugin.apply(null, args)
        }
        installedPlugins.push(plugin)
        return this
    }
}
```
接下来看下 install 函数的部分实现
```javascript
export function install(Vue) {
    // 确保 install 调用一次
    if (install.installed && _Vue === Vue) return
    install.installed = true
    // 把 Vue 赋值给全局变量
    _Vue = Vue

    const isDef = (v) => v !== undefined

    const registerInstance = (vm, callVal) => {
        let i = vm.$options._parentVnode
        if (
            isDef(i) &&
            isDef((i = i.data)) &&
            isDef((i = i.registerRouteInstance))
        ) {
            i(vm, callVal)
        }
    }
    // 给每个组件的钩子函数混入实现
    // 可以发现在 `beforeCreate` 钩子执行时
    // 会初始化路由
    Vue.mixin({
        beforeCreate() {
            // 判断组件是否存在 router 对象，该对象只在根组件上有
            if (isDef(this.$options.router)) {
                //保留当前Vue实例
                this._routerRoot = this
                //保留当前router实例
                this._router = this.$options.router
                //调用实例上的init方法
                this._router.init(this)
                //把_route变成响应式的
                Vue.util.defineReactive(this, '_route', this._router.history.current)
            } else {
                // 用于 router-view 层级判断
                this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
            }
            registerInstance(this, this)
        },
        destroyed() {
            registerInstance(this)
        }
    })
    //定义 $router $route
    Object.defineProperty(Vue.prototype, '$router', {
        get() {
            return this._routerRoot._router
        },
    })

    Object.defineProperty(Vue.prototype, '$route', {
        get() {
            return this._routerRoot._route
        },
    })
    // 全局注册组件 router-link 和 router-view
    Vue.component('RouterView', View)
    Vue.component('RouterLink', Link)
    const strats = Vue.config.optionMergeStrategies
    // use the same hook merging strategy for route hooks
    strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
```
对于路由注册来说，核心就是调用 Vue.use(VueRouter)，使得 VueRouter 可以使用 Vue。然后通过 Vue 来调用 VueRouter 的 install 函数。在该函数中，核心就是给组件混入钩子函数和全局注册两个路由组件。

### VueRouter 实例化
在安装插件后，对 VueRouter 进行实例化。
```javascript
const Home = { template: '<div>home</div>' }
const Foo = { template: '<div>foo</div>' }
const Bar = { template: '<div>bar</div>' }

// 3. Create the router
const router = new VueRouter({
    mode: 'hash',
    base: __dirname,
    routes: [
        { path: '/', component: Home }, // all paths are defined without the hash.
        { path: '/foo', component: Foo },
        { path: '/bar', component: Bar }
    ]
})
```

来看一下 VueRouter 的构造函数
```javascript
constructor(options: RouterOptions = {}) {
    // ...
    // 路由匹配对象
    this.matcher = createMatcher(options.routes || [], this)

    // 根据 mode 采取不同的路由方式
    let mode = options.mode || 'hash'
    this.fallback =
        mode === 'history' && !supportsPushState && options.fallback !== false
    if (this.fallback) {
        mode = 'hash'
    }
    if (!inBrowser) {
        mode = 'abstract' 
    }
    this.mode = mode

    switch (mode) {
        case 'history':
            this.history = new HTML5History(this, options.base)
            break
        case 'hash':
            this.history = new HashHistory(this, options.base, this.fallback)
            break
        case 'abstract':
            this.history = new AbstractHistory(this, options.base)
            break
        default:
            if (process.env.NODE_ENV !== 'production') {
                assert(false, `invalid mode: ${mode}`)
            }
    }
}
```