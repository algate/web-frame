```javascript
function shallowRef(obj) {
  return shallowReactive(obj:{value: obj})
}


function shallowReactive(obj) {
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