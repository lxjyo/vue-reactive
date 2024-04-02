const callbacks = [];
let pending = false;

/**
 * 执行所有回调
 */
function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

let microTimerFunc;
const p = Promise.resolve();
// 微任务队列函数
microTimerFunc = () => {
  p.then(flushCallbacks);
};

function nextTick(cb, ctx) {
  callbacks.push(() => {
    if (cb) {
      cb.call(ctx);
    }
  });
  // 多次调用只会添加一个微任务
  if (!pending) {
    pending = true;
    microTimerFunc();
  }
}

// 测试一下
nextTick(
  function () {
    console.log(this.name); // Berwin
  },
  { name: 'Berwin' }
);
