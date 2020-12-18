import Vue from 'Vue';
// option Api
let vm = new Vue({
    el: '#app',
    data() {
        return {
            name: 'darwin',
            age: 100,
            study: {
                title: 'vue',
                content: '数据劫持'
            },
            books: [
                {
                    name: '重写vue',
                },
                {
                    name: 'vue3.0'
                }
            ]
        }
    }
})

console.log(vm);
console.log(vm.name);
console.log(vm.books);