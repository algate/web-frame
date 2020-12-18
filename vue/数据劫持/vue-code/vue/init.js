import proxyData from './proxy';
function initState(vm) {
    var options = vm.$options;

    if(options.data) {
        initData(vm);
    }
}

function initData(vm) {
    // 临时数据-保存临时数据
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data || {};
    
    Object.keys(data).forEach( key => {
        // 数据代理 = vm._data.name -> vm.name
        proxyData(vm, '_data', key);
    })
}

export {
    initState
}