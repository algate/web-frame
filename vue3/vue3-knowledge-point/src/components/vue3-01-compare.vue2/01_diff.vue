<template>
    <div>
        <HelloWorld msg="1.diff算法" />
        <table border="1" cellspacing="0">
            <thead>
                <tr>
                    <th width="10%">diff算法</th>
                    <th width="20%">vue2</th>
                    <th width="70%">vue3</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>https://vue-next-template-explorer.netlify.app/</td>
                    <td>
                        <pre>
                            {{ diff.vue2 }}
                        </pre>
                    </td>
                    <td>
                        静态提升之前
                        <pre>{{ diff.vue3 }}</pre>
                    </td>
                </tr>
                <tr>
                    <td>静态标记, 动态属性</td>
                    <td>vue2中的虚拟Dom进行全量的对比</td>
                    <td>
                        vue3中新增了静态标记，与上次节点对比的时候，只对比带有pathch
                        flag的节点
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
    import HelloWorld from "../HelloWorld.vue";
    export default {
        name: "Diff",
        components: {
            HelloWorld,
        },
        data() {
            return {
                diff: {
                    vue3: `
export function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (_openBlock(), _createBlock("thead", null, [
        _createVNode("tr", null, [
        _createVNode("th", null, _toDisplayString(_ctx.diff), 1 /* TEXT */),
        _createVNode("th", null, "vue2"),
        _createVNode("th", null, "vue3")
        ])
    ]))
}`,
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
