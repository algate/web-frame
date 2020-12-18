<template>
    <div>
        <HelloWorld msg="3.cacheHandlers 事件监听器缓冲" />
        <table border="1" cellspacing="0">
            <thead>
                <tr>
                    <th width="10%">cacheHandlers</th>
                    <th width="20%">vue2</th>
                    <th width="70%">vue3</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>事件缓冲</td>
                    <td>
                        vue2.x默认情况下onClick会被视为动态绑定，每次都会去追踪它的变化；
                    </td>
                    <td>vue3.0 对统一函数，不追踪变化，直接缓冲起来复用即可</td>
                </tr>
                <tr>
                    <td>https://vue-next-template-explorer.netlify.app/</td>
                    <td>
                        <pre>{{diff.vue2}}</pre>
                    </td>
                    <td>
                        事件监听缓冲之前
                        <pre>
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("button", { onClick: _ctx.onClick }, "按钮", 8 /* PROPS */, ["onClick"])
  ]))
}                            
                        </pre>
                        事件监听缓冲之后
                        <pre>
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("button", {
      onClick: _cache[1] || (_cache[1] = (...args) => (_ctx.onClick && _ctx.onClick(...args)))
    }, "按钮")
  ]))
}                            
                        </pre>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
    import HelloWorld from "../HelloWorld.vue";
    export default {
        name: "CacheHandlers",
        components: {
            HelloWorld,
        },
        data() {
            return {
                diff: {
                    vue2: `
<div>
    <button @click="onClick">
        按钮
    </button>
</div>                    `,
                },
            };
        },
    };
</script>
