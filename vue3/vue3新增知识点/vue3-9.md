readonly shallowReadonly

```javascript
function shallowReadonly(obj) {
  return net Proxy (obj, handler:{
    get (obj, key) {
      return obj[key];
    }
    set (obj, key, val) {
      /* obj[key] = val;
      retur true; */
    }
  })
}
```

```js
function readonly(obj) {
  if(typeof obj === 'object') {
    if(obj instanceof Array) {
      // 数组
      obj.forEach(callbackfn: (item,index)=> {
        if(typeof item === 'object') {
          obj[index] = readonly(item)
        }
      })
    } else {
      // 对象
      for(let key in obj) {
        let item = obj[key];
        if(typeof item === 'object') {
          obj[key] = readonly(item)
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
      /* obj[key] = val;
      return true; */
    }
  })
}
```