##### init
在上一章中讲到install函数的时候，里面会调用vue-router实例上的init方法，这一节我们来看看init都做了些什么，init定义在class VueRouter，我们先不看其他部分，先分析init：
```javascript
init(app: any /* Vue component instance */) {
    process.env.NODE_ENV !== 'production' &&
    assert(
        install.installed,
        `not installed. Make sure to call \`Vue.use(VueRouter)\` ` +
        `before creating root instance.`
    )

    this.apps.push(app)

    // set up app destroyed handler
    // https://github.com/vuejs/vue-router/issues/2639
    app.$once('hook:destroyed', () => {
        // clean out app from this.apps array once destroyed
        const index = this.apps.indexOf(app)
        if (index > -1) this.apps.splice(index, 1)
        // ensure we still have a main app or null if no apps
        // we do not release the router so it can be reused
        if (this.app === app) this.app = this.apps[0] || null

        if (!this.app) this.history.teardown()
    })

    // main app previously initialized
    // return as we don't need to set up new history listener
    if (this.app) {
        return
    }

    this.app = app

    const history = this.history

    if (history instanceof HTML5History || history instanceof HashHistory) {
        const handleInitialScroll = (routeOrError) => {
            const from = history.current
            const expectScroll = this.options.scrollBehavior
            const supportsScroll = supportsPushState && expectScroll

            if (supportsScroll && 'fullPath' in routeOrError) {
                handleScroll(this, routeOrError, from, false)
            }
        }
        const setupListeners = (routeOrError) => {
            history.setupListeners()
            handleInitialScroll(routeOrError)
        }
        history.transitionTo(
            history.getCurrentLocation(),
            setupListeners,
            setupListeners
        )
    }

    history.listen((route) => {
        this.apps.forEach((app) => {
            app._route = route
        })
    })
}
```
首先在实例上的apps属性上推入当前的Vue实例。
监听destroyed事件，在apps上移除当前的Vue实例，并将this.app归还为上一次的Vue实例。
实例属性app赋值为当前Vue实例。
剩下的一些逻辑暂时还用不到，不用分析。

接下来我们再看看class VueRouter构造器。

##### constructor

```javascript
constructor(options: RouterOptions = {}) {
    this.app = null
    this.apps = []
    this.options = options
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
    this.matcher = createMatcher(options.routes || [], this)

    let mode = options.mode || 'hash'
    //如果浏览器不支持history 降级为hash
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
使用createMatcher新建一个matcher对象，这一部分我们放在下一章节去分析。
判断浏览器是否支持history路由模式，如果不支持会降级为hash模式。
对应每一模式会实例化对应的History子类。
继续向下查看实例方法。

```javascript
match(raw: RawLocation, current?: Route, redirectedFrom?: Location): Route {
    return this.matcher.match(raw, current, redirectedFrom)
}

get currentRoute(): ?Route {
    return this.history && this.history.current
}
beforeEach(fn: Function): Function {
    return registerHook(this.beforeHooks, fn)
}

beforeResolve(fn: Function): Function {
    return registerHook(this.resolveHooks, fn)
}

afterEach(fn: Function): Function {
    return registerHook(this.afterHooks, fn)
}

onReady(cb: Function, errorCb?: Function) {
    this.history.onReady(cb, errorCb)
}

onError(errorCb: Function) {
    this.history.onError(errorCb)
}

go(n: number) {
    this.history.go(n)
}

back() {
    this.go(-1)
}

forward() {
    this.go(1)
}

getRoutes() {
    return this.matcher.getRoutes()
}

addRoute(parentOrRoute: string | RouteConfig, route?: RouteConfig) {
    this.matcher.addRoute(parentOrRoute, route)
    if (this.history.current !== START) {
        this.history.transitionTo(this.history.getCurrentLocation())
    }
}

addRoutes(routes: Array<RouteConfig>) {
    if (process.env.NODE_ENV !== 'production') {
        warn(
        false,
        'router.addRoutes() is deprecated and has been removed in Vue Router 4. Use router.addRoute() instead.'
        )
    }
    this.matcher.addRoutes(routes)
    if (this.history.current !== START) {
        this.history.transitionTo(this.history.getCurrentLocation())
    }
}
getMatchedComponents(to?: RawLocation | Route): Array<any> {
    const route: any = to
        ? to.matched
        ? to
        : this.resolve(to).route
        : this.currentRoute
    if (!route) {
        return []
    }
    return [].concat.apply(
        [],
        route.matched.map((m) => {
            return Object.keys(m.components).map((key) => {
                return m.components[key]
            })
        })
    )
}
push(location: RawLocation, onComplete?: Function, onAbort?: Function) {
// $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
        return new Promise((resolve, reject) => {
        this.history.push(location, resolve, reject)
        })
    } else {
        this.history.push(location, onComplete, onAbort)
    }                   
}

replace(location: RawLocation, onComplete?: Function, onAbort?: Function) {
// $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
        return new Promise((resolve, reject) => {
        this.history.replace(location, resolve, reject)
        })
    } else {
        this.history.replace(location, onComplete, onAbort)
    }                                           
}
resolve(
    to: RawLocation,
    current?: Route,
    append?: boolean
): {
    location: Location,
    route: Route,
    href: string,
    // for backwards compat
    normalizedTo: Location,
    resolved: Route,
} {
    current = current || this.history.current
    const location = normalizeLocation(to, current, append, this)
    const route = this.match(location, current)
    const fullPath = route.redirectedFrom || route.fullPath
    const base = this.history.base
    const href = createHref(base, fullPath, this.mode)
    return {
        location,
        route,
        href,
        // for backwards compat
        normalizedTo: location,
        resolved: route,
    }
}
```
这里面有些方法平时我们开发都经常使用，一眼就能看出是干什么的，具体里面的实现我们放到后面去分析。
到这，就分析完毕VueRouter类的大致流程了。