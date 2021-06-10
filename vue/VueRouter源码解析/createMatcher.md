createMatcher
在上一章VueRouter构造器中会调用createMatcher创建一个matcher对象，我们这次来看看createMatcher具体做了些什么。
```javascript
const { pathList, pathMap, nameMap } = createRouteMap(routes)
```

先使用了createRouteMap创建了了三个对象pathList，pathMap，nameMap。
进入createRouteMap查看。

createRouteMap

```javascript
export function createRouteMap(
    routes: Array<RouteConfig>,
    oldPathList?: Array<string>,
    oldPathMap?: Dictionary<RouteRecord>,
    oldNameMap?: Dictionary<RouteRecord>,
    parentRoute?: RouteRecord
): {
    pathList: Array<string>,
    pathMap: Dictionary<RouteRecord>,
    nameMap: Dictionary<RouteRecord>,
} {
    // the path list is used to control path matching priority
    //存放所有路由path
    const pathList: Array<string> = oldPathList || []
    // $flow-disable-line
    //以path为key存放所有路由描述
    const pathMap: Dictionary<RouteRecord> = oldPathMap || Object.create(null)
    // $flow-disable-line
    //以name为key存放所有路由描述
    const nameMap: Dictionary<RouteRecord> = oldNameMap || Object.create(null)

    routes.forEach((route) => {
        addRouteRecord(pathList, pathMap, nameMap, route, parentRoute)
    })

    // ensure wildcard routes are always at the end
    //如果path里面有*,就放到结尾
    for (let i = 0, l = pathList.length; i < l; i++) {
        if (pathList[i] === '*') {
            pathList.push(pathList.splice(i, 1)[0])
            l--
            i--
        }
    }

    if (process.env.NODE_ENV === 'development') {
        // warn if routes do not include leading slashes
        const found = pathList
        // check for missing leading slash
        .filter(
            (path) => path && path.charAt(0) !== '*' && path.charAt(0) !== '/'
        )

        if (found.length > 0) {
            const pathNames = found.map((path) => `- ${path}`).join('\n')
            warn(
                false,
                `Non-nested routes must include a leading slash character. Fix the following routes: \n${pathNames}`
            )
        }
    }

    return {
        pathList,
        pathMap,
        nameMap,
    }
}
```
一开始创建了三个对象pathList，pathMap，nameMap，如果没有传入的话就创建空对象。之后遍历routes数组，为每一个route调用addRouteRecord，进入addRouteRecord。

**addRouteRecord**
这里的代码较多，我们一步一步来看，同时忽略非主线代码。

```javascript
//计算父子path(如果有父子关系的话)以及规范化path
const normalizedPath = normalizePath(path, parent, pathToRegexpOptions.strict)

//定义路由描述
const record: RouteRecord = {
    path: normalizedPath,
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    components: route.components || { default: route.component },
    alias: route.alias
        ? typeof route.alias === 'string'
        ? [route.alias]
        : route.alias
        : [],
    instances: {},
    enteredCbs: {},
    name,
    parent,
    matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {},
    props:
        route.props == null
        ? {}
        : route.components
        ? route.props
        : { default: route.props },
}
```

调用了一个normalizePath，之后定义了一个record路由记录，其实就是将用户传入的路由对象进行扩展了。
我们先进入normalizePath。

normalizePath

```javascript
function normalizePath(
    path: string,
    parent?: RouteRecord,
    strict?: boolean
): string {
    if (!strict) path = path.replace(/\/$/, '')
    if (path[0] === '/') return path
    if (parent == null) return path
    return cleanPath(`${parent.path}/${path}`)
}
```
其实就是拼接了parent.path和path。
回到createRouteMap。

```javascript
if (route.children) {
   	//递归对所有child做同样的操作
    route.children.forEach((child) => {
      const childMatchAs = matchAs
        ? cleanPath(`${matchAs}/${child.path}`)
        : undefined
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
    })
}
```

对route.chilren遍历之后递归，也就是再做一次createRouteMap，继续向下。

```javascript
//将当前路由路径推入pathList栈中
//以当前路由path为key,以当前路由描述为value,在pathMap中加入一条记录
if (!pathMap[record.path]) {
    pathList.push(record.path)
    pathMap[record.path] = record
}

if (name) {
	if (!nameMap[name]) {
	    nameMap[name] = record
	} else if (process.env.NODE_ENV !== 'production' && !matchAs) {
        warn(
            false,
            `Duplicate named routes definition: ` +
            `{ name: "${name}", path: "${record.path}" }`
        )
	}
}
```
这边就是这个createRouteMap做的最主要的操作了。
将当前路由路径推入pathList数组中。
以当前路由路径为key，record为value，在pathMap上创建一条记录。
以当前路由的name为key，record为value，在nameMap上创建一条记录。

我们再回到createMatcher。

```javascript
//定义动态添加路由的方法
function addRoutes(routes) {
    createRouteMap(routes, pathList, pathMap, nameMap)
}

function addRoute(parentOrRoute, route) {
    const parent =
        typeof parentOrRoute !== 'object' ? nameMap[parentOrRoute] : undefined
    // $flow-disable-line
    createRouteMap([route || parentOrRoute], pathList, pathMap, nameMap, parent)

    // add aliases of parent
    if (parent) {
        createRouteMap(
            // $flow-disable-line route is defined if parent is
            parent.alias.map((alias) => ({ path: alias, children: [route] })),
            pathList,
            pathMap,
            nameMap,
            parent
        )
    }
}

function getRoutes() {
    return pathList.map((path) => pathMap[path])
}
```

首先是addRoutes，由于之前createRouteMap已经对pathList，pathMap，nameMap，做了记录了，所以这addRoutes这个API的作用是在当前记录上继续添加多条记录（由于有时候需要使用动态路由），接下来的addRoute也是一样，只不过是添加单条。那getRoutes就更简单了，就是将pathList处理之后返回。

我们接下来看看match方法。

**match**
match方法的作用是传入一个URI字符串或者路径对象，生成一个路由对象并返回。我们来看看具体实现：

```javascript
function match(
    raw: RawLocation,
    currentRoute?: Route,
    redirectedFrom?: Location
): Route {
    const location = normalizeLocation(raw, currentRoute, false, router)
    const { name } = location

    if (name) {
        const record = nameMap[name]
        if (process.env.NODE_ENV !== 'production') {
            warn(record, `Route with name '${name}' does not exist`)
        }
        if (!record) return _createRoute(null, location)
        const paramNames = record.regex.keys
            .filter((key) => !key.optional)
            .map((key) => key.name)

        if (typeof location.params !== 'object') {
            location.params = {}
        }

        if (currentRoute && typeof currentRoute.params === 'object') {
            for (const key in currentRoute.params) {
                if (!(key in location.params) && paramNames.indexOf(key) > -1) {
                    location.params[key] = currentRoute.params[key]
                }
            }
        }

        location.path = fillParams(
            record.path,
            location.params,
            `named route "${name}"`
        )
        return _createRoute(record, location, redirectedFrom)
    } else if (location.path) {
        location.params = {}
        for (let i = 0; i < pathList.length; i++) {
            const path = pathList[i]
            const record = pathMap[path]
            if (matchRoute(record.regex, location.path, location.params)) {
                return _createRoute(record, location, redirectedFrom)
            }
        }
    }
    // no match
    return _createRoute(null, location)
}
```
首先调用normalizeLocation解析当前的字符串或者是对象，返回一个location对象并保存。
判断location中是否有name属性 ，如果有name属性就从闭包中的nameMap中取出相应的路由记录，最后调用_createRoute创建一个新的路由对象，进入_createRoute。

**_createRoute**
```javascript
function _createRoute(
    record: ?RouteRecord,
    location: Location,
    redirectedFrom?: Location
): Route {
    if (record && record.redirect) {
        return redirect(record, redirectedFrom || location)
    }
    if (record && record.matchAs) {
        return alias(record, location, record.matchAs)
    }
    return createRoute(record, location, redirectedFrom, router)
}
```
redirect和alias先不看，这边直接调用了createRoute，进入。

**createRoute**

```javascript
export function createRoute (
    record: ?RouteRecord,
    location: Location,
    redirectedFrom?: ?Location,
    router?: VueRouter
): Route {
    const stringifyQuery = router && router.options.stringifyQuery

    let query: any = location.query || {}
    try {
        query = clone(query)
    } catch (e) {}

    const route: Route = {
        name: location.name || (record && record.name),
        meta: (record && record.meta) || {},
        path: location.path || '/',
        hash: location.hash || '',
        query,
        params: location.params || {},
        fullPath: getFullPath(location, stringifyQuery),
        matched: record ? formatMatch(record) : []
    }
    if (redirectedFrom) {
        route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery)
    }
    return Object.freeze(route)
}
```

大概就是创建一个新的路由对象。
回到match。
如果没有name，但是有path，就遍历闭包中的pathList，用正则匹配记录，如果找到的话也会使用_createRoute创建一个新的路由并返回。

**总结**

总的来说matcher做了两件事：1.创建了一个路由的映射表 2.使用match匹配路由表，返回一个路由对象。其实matcher是Vue-Router一个辅助的部分，主要是为接下来的transitionTo服务的，这部分我们放在下一章节去分析。