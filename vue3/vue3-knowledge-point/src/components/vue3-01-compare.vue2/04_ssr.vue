<template>
    <div>
        <HelloWorld msg="4.ssr渲染" />
        <table border="1" cellspacing="0">
            <thead>
                <tr>
                    <th width="10%">ssr渲染</th>
                    <th width="45%">vue2</th>
                    <th width="45%">vue3</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td></td>
                    <td>
                        vue2.x 当有大量静态的内容时，这些内容会被当做纯字符串推进一个buffer里面， 即使存在动态的绑定，会通过模板 插值嵌入进去，这样会比通过虚拟dom来渲染的快很多
                    </td>
                    <td>vue3.0 当静态文件大到一定量的时候，会用_ceratStaticVNode方法在客户端去生成一个static node, 这些静态node,会被直接innerHtml,就不需要创建对象，然后根据对象渲染</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
    import HelloWorld from "../HelloWorld.vue";
    export default {
        name: "Ssr",
        components: {
            HelloWorld,
        },
        data() {
            return {};
        },
    };
</script>
