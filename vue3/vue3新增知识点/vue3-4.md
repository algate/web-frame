1. ref 获取元素 
```js
<div ref="box"></div>
setup() {
  let box = ref(null);
  console.log(box.value);
  return {box};
}
```
上述代码获取的box：`undefined`

setup 在beforeCreate 和 create 生命周期之间执行 - 获取不到元素(mounted)

想在setup中获取元素
```js
import {onMounted} from 'vue'
setup() {
  let box = ref(null)
  onMounted (()=> {
    console.log(box.value); // - 元素本身
  })
  console.log(box.value); // - undefined
  // onMounted 的console后执行；
  return {box}
}
```