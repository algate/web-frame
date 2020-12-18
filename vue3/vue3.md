# vue3.0 - v3.0.0 One Piece 
github-actions released this on 18 Sep 2020 · 320 commits to master since this release

## 学习Vue3.0？
- 循序渐进学
    - 上线项目暂时还不会用
    - 相关生态还有待完善
- 可以先学习Vue2.X版本
    - Vue3.0向下兼容Vue2.X版本
- 学习Typescript
    - Vue3.0采用TS重写，必须掌握TS

## Vue3.0 六大两点
- 性能比vue2.X快1.2^2倍
- 按需编译，体积比vue2.X更小
- Composition API，组合api
- 更好的TS支持
- 暴露了自定义渲染API
- Fragment、Protal、Suspense等更先进的组件

### 1.如何变快的
- diff方法的优化：
    + vue2.X的虚拟Dom是进行全量的对比（对应的所有dom都对比一遍，增加了对比次数和渲染速度）
    + vue3.0添加了静态标记（与上次dom节点对比的时候，只对比有静态标记的dom进行渲染）
- hoistStast 静态提升：
    + vue2.x无论元素是否参与更新，每次都重新创建，然后渲染
    + vue3.0对于不参与更新的元素，会做静态提升，只会被创建一次，渲染时直接服用即可
- 事件监听器缓冲
    + vue2.x默认情况下onClick会被视为动态绑定，每次都会去追踪它的变化；
    + vue3.0 对统一函数，不追踪变化，直接缓冲起来复用即可
- ssr渲染
    + vue2.x 当有大量静态的内容时，这些内容会被当做纯字符串推进一个buffer里面， 即使存在动态的绑定，会通过模板 插值嵌入进去，这样会比通过虚拟dom来渲染的快很多
    + vue3.0 当静态文件大到一定量的时候，会用_ceratStaticVNode方法在客户端去生成一个static node, 这些静态node,会被直接innerHtml,就不需要创建对象，然后根据对象渲染

#### diff算法
>https://vue-next-template-explorer.netlify.app/
```html
<thead>
    <tr>
        <th>{{diff}}</th>
        <th>vue2</th>
        <th>vue3</th>
    </tr>
</thead>
```
添加静态标记 - (也就是静态提升之前)
```javascript
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock("thead", null, [
    _createVNode("tr", null, [
      _createVNode("th", null, _toDisplayString(_ctx.diff), 1 /* TEXT */),
      _createVNode("th", null, "vue2"),
      _createVNode("th", null, "vue3")
    ])
  ]))
}
```
#### 静态提升
静态提升之后，与之前相比较
```javascript
const _hoisted_1 = /*#__PURE__*/_createVNode("th", null, "vue2", -1 /* HOISTED */)
const _hoisted_2 = /*#__PURE__*/_createVNode("th", null, "vue3", -1 /* HOISTED */)

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock("thead", null, [
    _createVNode("tr", null, [
      _createVNode("th", null, _toDisplayString(_ctx.diff), 1 /* TEXT */),
      _hoisted_1,
      _hoisted_2
    ])
  ]))
}
```

#### 事件缓冲
```html
<div>
  <button @click="onClick">按钮</button>
</div>
```
事件监听缓冲之前
```javascript
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("button", { onClick: _ctx.onClick }, "按钮", 8 /* PROPS */, ["onClick"])
  ]))
}
```
事件监听缓冲之后
```javascript
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("button", {
      onClick: _cache[1] || (_cache[1] = (...args) => (_ctx.onClick && _ctx.onClick(...args)))
    }, "按钮")
  ]))
}
```