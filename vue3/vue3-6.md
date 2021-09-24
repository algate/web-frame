vue 响应式数据本质
```js
obj = {name: 'vue', age: 5};
state = new Proxy(obj, handler: {
  get(obj, key) {
    return obj[key];
  },
  set(obj, key, value) {
    obj[key] = value;
    return true;
  }
})
```