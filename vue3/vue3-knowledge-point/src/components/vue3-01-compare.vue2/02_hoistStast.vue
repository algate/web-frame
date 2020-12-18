<template>
    <div>
        <HelloWorld msg="2.hoistStast 静态提升" />
        <table border="1" cellspacing="0">
            <thead>
                <tr>
                    <th width="10%">hoistStast 静态提升</th>
                    <th width="20%">vue2</th>
                    <th width="70%">vue3</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>静态提升</td>
                    <td>
                        vue2中无论元素是否参与更新，每次都会重新创建，然后重新渲染
                    </td>
                    <td>
                        vue3中对于不参与更新的元素，会做静态提升，只会被创建一次，在创建的时候直接复用即可
                    </td>
                </tr>
                <tr>
                    <td>https://vue-next-template-explorer.netlify.app/</td>
                    <td>
                        <pre>{{ diff.vue2 }}</pre>
                    </td>
                    <td>
                        静态提升之后
                        <pre>
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
        name: "HoistStast",
        components: {
            HelloWorld,
        },
        data() {
            return {
                diff: {
                    vue2: `
<thead>
    <tr>
        <th>{{diff}}</th>
        <th>vue2</th>
        <th>vue3</th>
    </tr>
</thead>
                    `
                },
            };
        },
    };
</script>
