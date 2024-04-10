import { reactive, effect, computed, watch, ref } from './reactive.js';
import flushingQueue from './flushingQueue.js';

const proxy = reactive({
  count: 1,
  msg: 'test',
  ok: true,
});

// effect(() => {
//   console.log('outter run')
//   console.log(proxy.ok ? proxy.count: 'none')
//   effect(() => {
//     console.log('inner run', proxy.count)
//   })
// })

// proxy.ok = false;

// effect(() => {
//   console.log(proxy.count)
// })
// effect(() => {
//   proxy.count += 2;
// })

// 调度器1
// effect(
//   () => {
//     console.log(proxy.count);
//   },
//   {
//     scheduler: (effectFn) => {
//       setTimeout(effectFn, 2000);
//     },
//   }
// );

// proxy.count++;
// console.log('end')

// 调度器2 任务队列
// effect(
//   () => {
//     console.log(proxy.count);
//   },
//   {
//     scheduler: (effectFn) => {
//       flushingQueue(effectFn);
//     },
//   }
// );

// proxy.count = 2;
// proxy.count = 3;
// proxy.count = 4;

// 计算属性
// const compV = computed(() => proxy.count + ': ' + proxy.msg);
// effect(() => {
//   console.log('effect ', compV.value);
//   console.log(compV.value);
// });

// // 监听器
// watch(
//   proxy,
//   () => {
//     console.log('changed');
//   },
//   {
//     immediate: true,
//   }
// );

// proxy.count = 3;


const count = ref(1);

effect(() => {
  console.log(count.value)
})

count.value++;