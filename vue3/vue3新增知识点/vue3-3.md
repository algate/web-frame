1. customRef
```js
import {customRef} from 'vue'

function myRef(value) {
  return customRef((track, trigger)=>{
    return {
      get() {
        track(); // 告诉vue这个数据需要追踪
        return value;
      },
      set(newValue) {
        value = newValue;
        trigger(); // 告诉vue触发UI更新
      }
    }
  })
}
```

2. 
```js
function myRef(url)) {
  let value;
  fetch(url).then(res=> {
    return res.json()
  }).then(data=> {
    value = data;
    trigger();
  });
  return customRef((track, trigger)=>{
    return {
      get() {
        track(); // 告诉vue这个数据需要追踪
        return value;
      },
      set(newValue) {
        value = newValue;
        trigger(); // 告诉vue触发UI更新
      }
    }
  })
}
```