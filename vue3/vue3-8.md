shallowReactive shallowRef; 非递归监听
reactive ref; 递归监听

```javascript
function ref(val) {
  return reactive(obj:{value: val})
}


function reactive(obj) {
  if(typeof obj === 'object') {
    if(obj instanceof Array) {
      // 数组
      obj.forEach(callbackfn: (item,index)=> {
        if(typeof item === 'object') {
          obj[index] = reactive(item)
        }
      })
    } else {
      // 对象
      for(let key in obj) {
        let item = obj[key];
        if(typeof item === 'object') {
          obj[key] = reactive(item)
        }
      }
    }

  }else {
    console.error('is not object')
  }
  return net Proxy (obj, handler:{
    get (obj, key) {
      return obj[key];
    }
    set (obj, key, val) {
      obj[key] = val;
      return true;
    }
  })
}
```