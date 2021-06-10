**transitionTo**

在切换路由时，我们会调用push方法，这里以hash router为例，进入实例方法push：
```javascript
push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(
        location,
        route => {
            pushHash(route.fullPath)
            handleScroll(this.router, route, fromRoute, false)
            onComplete && onComplete(route)
        },
        onAbort
    )
}
```
可以看出push其实是调用的transitionTo，进入transitionTo：
```javascript
transitionTo(
    location: RawLocation,
    onComplete?: Function,
    onAbort?: Function
) {
    let route
    // catch redirect option https://github.com/vuejs/vue-router/issues/3201
    try {
        route = this.router.match(location, this.current)
    } catch (e) {
        this.errorCbs.forEach((cb) => {
            cb(e)
        })
        // Exception should still be thrown
        throw e
    }
    const prev = this.current
    this.confirmTransition(
    	route,
    	()=>{ ... complate actions },
    	()=>{ ... fail actions }
    )
}
```
这边先是进行了一次match，关于match已经在上一篇中详细说过了，在这里就不过多赘述，然后把match到的路由传入 confirmTransition 方法。我们进入confirmTransition方法查看一下。

**confirmTransition**

confirmTransition的代码量比较多，我这边剔除了非主线代码：
```javascript
confirmTransition(route: Route, onComplete: Function, onAbort?: Function) {
    const current = this.current
    
    const { updated, deactivated, activated } = resolveQueue(
	    this.current.matched,
	    route.matched
    )
    
    const queue: Array<?NavigationGuard> = [].concat(
        // in-component leave guards
        //在失活组件中调用 beforeRouteLeave
        extractLeaveGuards(deactivated),
        // global before hooks
        //调用 beforeEach
        this.router.beforeHooks,
        // in-component update hooks
        //调用 beforeRouteUpdate
        extractUpdateHooks(updated),
        // in-config enter guards
        //调用激活组件中的 beforeEnter
        activated.map((m) => m.beforeEnter),
        // async components
        resolveAsyncComponents(activated)
    )

    const iterator = (hook: NavigationGuard, next) => {
        if (this.pending !== route) {
            return abort(createNavigationCancelledError(current, route))
        }
        try {
            hook(route, current, (to: any) => {
            if (to === false) {
                // next(false) -> abort navigation, ensure current URL
                this.ensureURL(true)
                abort(createNavigationAbortedError(current, route))
            } else if (isError(to)) {
                this.ensureURL(true)
                abort(to)
            } else if (
                typeof to === 'string' ||
                (typeof to === 'object' &&
                (typeof to.path === 'string' || typeof to.name === 'string'))
            ) {
                // next('/') or next({ path: '/' }) -> redirect
                abort(createNavigationRedirectedError(current, route))
                if (typeof to === 'object' && to.replace) {
                    this.replace(to)
                } else {
                    this.push(to)
                }
            } else {
                // confirm transition and pass on the value
                next(to)
            }
            })
        } catch (e) {
            abort(e)
        }
    }

    runQueue(queue, iterator, () => {
        // wait until async components are resolved before
        // extracting in-component enter guards
        const enterGuards = extractEnterGuards(activated)
        const queue = enterGuards.concat(this.router.resolveHooks)
        runQueue(queue, iterator, () => {
            if (this.pending !== route) {
                return abort(createNavigationCancelledError(current, route))
            }
            this.pending = null
            onComplete(route)
            if (this.router.app) {
                this.router.app.$nextTick(() => {
                handleRouteEntered(route)
                })
            }
        })
    })
}
```
我们把 confirmTransition 的逻辑分为三部分resolveQueue、iterator、runQueue一一解读。我们先看看resolveQueue：

```javascript
const { updated, deactivated, activated } = resolveQueue(
   this.current.matched,
   route.matched
)
 
...

function resolveQueue(
    current: Array<RouteRecord>,
    next: Array<RouteRecord>
): {
    updated: Array<RouteRecord>,
    activated: Array<RouteRecord>,
    deactivated: Array<RouteRecord>,
} {
    let i
    const max = Math.max(current.length, next.length)
    for (i = 0; i < max; i++) {
        if (current[i] !== next[i]) {
            break
        }
    }
    return {
        updated: next.slice(0, i), //没有变化的部分,顺序为先父后子
        activated: next.slice(i), //激活的部分,顺序为先父后子
        deactivated: current.slice(i), //失活的部分,顺序为先父后子
    }
}
```
可以看到resolveQueue是把当前的路径队列和将要去往的路径队列进行对比长度，然后遍历最长的路径队列，从两个路径不一样的地方开始截取。updated为之前一样的部分，activated为将要去往路径的不一样的部分，deactivated为当前路径的不一样的部分。

接下来我们继续分析confirmTransition，在分析iterator之前我们需要先分析runQueue：
```javascript
const queue: Array<?NavigationGuard> = [].concat(
    // in-component leave guards
    //在失活组件中调用 beforeRouteLeave
    extractLeaveGuards(deactivated),
    // global before hooks
    //调用 beforeEach
    this.router.beforeHooks,
    // in-component update hooks
    //调用 beforeRouteUpdate
    extractUpdateHooks(updated),
    // in-config enter guards
    //调用激活组件中的 beforeEnter
    activated.map((m) => m.beforeEnter),
    // async components
    resolveAsyncComponents(activated)
)

runQueue(queue, iterator, () => {
    // wait until async components are resolved before
    // extracting in-component enter guards
    const enterGuards = extractEnterGuards(activated)
    const queue = enterGuards.concat(this.router.resolveHooks)
    runQueue(queue, iterator, () => {
        if (this.pending !== route) {
            return abort(createNavigationCancelledError(current, route))
        }
        this.pending = null
        onComplete(route)
        if (this.router.app) {
            this.router.app.$nextTick(() => {
            handleRouteEntered(route)
            })
        }
    })
})
```
先使用concat拼接了一个数组，具体拼接了什么我们具体看，但是我们从类型中可以看出来数组中每个存放的元素都是NavigationGuard。关于NavigationGuard的定义：

```javascript
declare type NavigationGuard = (
    to: Route,
    from: Route,
    next: (to?: RawLocation | false | Function | void) => void
) => any
```
类似于我们平时使用的路由hook的定义，有to、from、next三个参数。那么这个queue中存储的都是这样的函数。
然后调用了runQueue，传入了刚刚的queue和上面的iterator和一个函数。

**runQueue**

进入runQueue：
```javascript
export function runQueue (queue: Array<?NavigationGuard>, fn: Function, cb: Function) {
    const step = index => {
        if (index >= queue.length) {
            cb()
        } else {
            if (queue[index]) {
                fn(queue[index], () => {
                    step(index + 1)
                })
            } else {
                step(index + 1)
            }
        }
    }
    step(0)
}
```
* if index >= queue.length也就是这个方法最后要调用的step(0)中的参数大于队列的长度时候，直接调用刚刚传入的回调，由于这个回到函数具体做了什么非常重要，我们放到之后去讲。
* else if queue[index]如果队列中存在当前下标的hook的话，就调用iterator，并传入当前遍历到的hook和一个回调，这个回调如果执行的话就会调用step(index + 1)，也就是继续遍历queue。
* else 如果没有对应的hook的话，就直接调用step(index + 1)。

这其实就是一个队列调用的实现。

看完了runQueue之后，我们就可以回去看看iterator了。

**iterator**

```javascript
const iterator = (hook: NavigationGuard, next) => {
    if (this.pending !== route) {
        return abort(createNavigationCancelledError(current, route))
    }
    try {
        hook(route, current, (to: any) => {
            if (to === false) {
            // next(false) -> abort navigation, ensure current URL
                this.ensureURL(true)
                abort(createNavigationAbortedError(current, route))
            } else if (isError(to)) {
                this.ensureURL(true)
                abort(to)
            } else if (
                typeof to === 'string' ||
                    (typeof to === 'object' &&
                        (typeof to.path === 'string' || typeof to.name === 'string'))
            ) {
                // next('/') or next({ path: '/' }) -> redirect
                abort(createNavigationRedirectedError(current, route))
                if (typeof to === 'object' && to.replace) {
                    this.replace(to)
                } else {
                    this.push(to)
                }
            } else {
                // confirm transition and pass on the value
                next(to)
            }
        })
    } catch (e) {
        abort(e)
    }
}

```
可以看到iterator就是调用了相对应的hook，hook有三个参数:to，from，next。前两个没什么好说的，我们直接来看看next，也就是后面的一大串逻辑。
其实不要看这边逻辑这么多，平时我们使用路由钩子的时候，最后都是调用next()，所以我们直接略过上面的一大串，直接看else，else里面只有一行代码next(to)。也就是直接调用的runQueue里面的setp(index + 1)。
这下就全部清楚了，为什么平时使用路由钩子的时候一定要调用next了，如果不调用next，路由队列是不会遍历的。

**总结**

至此，我们大致就分析完了transitionTo的原理了，其实transitionTo是一个路由队列的遍历过程。至于那个queue中到底concat了什么东西，我们就放到了下一章去分析。