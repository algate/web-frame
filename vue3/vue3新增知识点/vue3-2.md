```js
import {toRaw} from 'vue';

import {reactive} from 'vue';
export defautl {
  setup() {
    let obj = {name: 'vue3', age: '2021'};
    /*
    ref/reactive 数据类型的特点：
    每次修改都会被追踪，都会更新UI界面
    如果有些操作不需要更新UI界面，通过toRaw 拿到原始数据，对原始数据修改，就不会被追踪，就不会更新UI；
    */
    let state = reactive(obj);

    let obj2 = toRaw(state)
    // obj2 === obj; --->true

    function Fun() {
      obj.name = 'reactive';
      console.log(obj);  // {name: 'reactive', age: '2021'}
      console.log(state);  // {name: 'reactive', age: '2021'}
      <!-- 但是页面UI不会渲染 -->
      // 直接修改obj，是无法触发UI的
      // 只能通过 包装之后的对象来修改，才会触发界面UI
    }
    return {state, Fun};
  }
}
```
toRaw 是获取 reactive 原始数据

2. toRaw - 获取ref的原始数据

ref的原始数据
ref本质：ref(obj) -> reactive({value: obj})

toRaw 获取ref的原始数据
```js
let obj；
let state = ref(obj);
obj2 = toRaw(state.value)

obj2 === obj // true
```

3. markRaw 数据不会被追踪，不会变成响应式数据

不想被追踪
```js
obj = markRaw(obj);
```
再通过reactive/ref修改就不会发生变化；

4. toRef
```js
let obj = {name: 'vue'}

let state = ref(obj.name)
let state = toRef(obj, 'name')
```
// 如果通过ref将对象的某一属性变成相应式数据，我们修改响应式数据不会影响原始数据  ref =>复制
// 如果通过toRef将对象的某一属性变成响应式数据，我门修改数据会影响到原始数据，但是不会触发UI更新 toRef=>引用

ref： 复制：修改相应式数据不会影响原始数据
toRef： 引用：修改响应式数据会影响原始数据
ref：数据发生改变，界面就会更新
toRef：数据发生改变，界面不会发生改变

toRef应用场景：如果想让响应式数据和原始数据关联，并且更新响应式数据，不想更新UI

5. toRef 多个属性变成响应式数据 多次调用
```js
// toRef
toRef(obj, 'name');
toRef(obj, 'age');

// toRefs 
obj = {name: 'vue', age: 5}
let state = toRefs(obj)

state.name.value = '';
state.age.value = 666
```