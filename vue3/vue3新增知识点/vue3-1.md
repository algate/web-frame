1.
```js
import {ref} from 'vue'

setup() {
  let count = ref(0);
  // <!-- 在组合API中，定义方法，不用定义methods，直接定义暴露即可 -->
  myFn() {
    console.log(count.value)； // count为对象{};
  }
  // <!-- 组合API中殿义的变量/方法，要想在外界使用，return {xxx} -->
  return {count,myFn}
}
```
2.
ref注意点：
ref只能监听简单类型的变化。不能监听复杂类型的变化
自动给ref值绑定为.value。但是双向绑定的时候不需要写.value
```js
import {reactive} from "vue"

let stats = reactive({
  lists: [
    {id: 1, name: vue3},
    {id: 2, name: vue2},
  ]
})
return {stats}
```
3.
```js
expor default {
  setup() {
    let {student, addStudent} = userStudent();
    return {student, addStudent}
  }
}

// <!-- export default 的外部编写方法 -->
function userStudent() {
  let state = reactive({
    student: [{
      id: 1,
      name: 'vue3'
    },{
      id: 2,
      name: 'vue2'
    }]
  })
  addStudent() {
    // add studeng
  }
  return {state, addStudeng}
}
```
4. 判断是ref/reactive
```js
import {isRef, isReactive} from 'vue'

`ref/reactive` 是递归监听数据的 - 消耗性能
```
5. 
非递归监听 {shallowRef, shallowReactive} 只能监听第一层的数据
```js
import {shallowReactive} from 'vue'
let data = shallowReactive({
  a: 'a',
  b: {
    b: 'b',
    c: {
      c: 'c'
    }
  }
})
state.a = 1;
state.b.b = 2;
state.b.c.c = 3;
```
此时页面是变化的 ( 监听第一层变化，UI更新后，就把后边的更新了 )
只有a是 Proxy 对象

当注释掉 state.a = 1; 之后
b，c都不在发生变化；第一层间听没有变化就不更新UI
```js
import {shallowRef} from 'vue'
let data = shallowRef({
  a: 'a',
  b: {
    b: 'b',
    c: {
      c: 'c'
    }
  }
})
state.value.a = 1;
state.value.b.b = 2;
state.value.b.c.c = 3;
```
此时页面是不变化的 （与shallowReactive的区别）
通过 shallowRef 创建数据 Vue监听的是 .value 的变化

需要给value赋值

6 非递归监听要修改 第二层数据的值
```js
import {triggerRef} from 'vue'
import {shallowRef} from 'vue'
let data = shallowRef({
  a: 'a',
  b: {
    b: 'b',
    c: {
      c: 'c'
    }
  }
})
state.value.a = 1;
state.value.b.b = 2;
state.value.b.c.c = 3;
triggerRef(state);  此时就可以修改；
```
只提供了triggerRef方法；
如果是reactive类型的数据，是无法主动触发界面更新的；

应用场景： 数据量大，只修改局部数据的时候用非递归监听；
否则使用递归监听就行了。