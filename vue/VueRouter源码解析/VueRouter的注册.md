vue-router的注册
vue-router相信小伙伴已经使用的非常熟练了，在使用vue-router之前，我们需要对vue-router进行注册：
```javascript
Vue.use(VueRouter)

const router = new VueRouter({
	routes:[{ path:"/",component:App }]
})

const vm = new Vue({
	template:'<div id="app">',
	components:{App},
	router
})
```
其中需要使用Vue.use来注册vue-router插件，我们来看看vue源码中关于Vue.use的定义。

Vue.use
```javascript
Vue.use = function (plugin: Function | Object) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
        return this
    }
    // additional parameters
    const args = toArray(arguments, 1)
    args.unshift(this)
    if (typeof plugin.install === 'function') {
        plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
        plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
}
```
前面是一些防止重复注册的逻辑，我们可以不看，直接看后面。Vue.use其实就是调用了插件自身的install方法，或者插件本身就是个函数的话就会直接调用这个函数。
所以我们需要看看vue-router是如何定义install方法的。

install
```javascript
export function install(Vue) {
    if (install.installed && _Vue === Vue) return
    install.installed = true

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

    Vue.mixin({
        beforeCreate() {
            //如果当前为根实例
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
                //不是根实例就向上找根实例
                this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
            }
            registerInstance(this, this)
        },
        destroyed() {
            registerInstance(this)
        },
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

    //注册 <router-view /> <router-link />
    Vue.component('RouterView', View)
    Vue.component('RouterLink', Link)

    const strats = Vue.config.optionMergeStrategies
    // use the same hook merging strategy for route hooks
    strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
```
首先定义了一个registerInstance方法，这个我们以后会介绍。然后调用了Vue的api：Vue.mixin，混入了一段逻辑。在这里vue-router为每一个vue实例混入了beforeCreate和destroyed钩子函数。
beforeCreate中先判断Vue.$oprions是否有router属性，防止重复注册。如果没有就定义了一些私有属性_routerRoot指向当前Vue实例，_router指向当前router实例，然后调用了router实例上的init方法，最后又将_routerRoot变为响应式的。然后又调用了registerInstance，以及在destroyed钩子中也会调用一次。

混入完成之后又会扩展Vue的API：$router和$route分别指向当前实例上的_router以及_route属性。

最后又会注册两个组件:RouterView和RouterLink这两个相信大家都不陌生吧。

至此，vue-router的注册过程分析完毕。
