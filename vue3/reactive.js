const bucket = new WeakMap(); // WeakMap 对key是弱引用，不影响垃圾回收
const effectStack = []; // 副作用栈
let activeEffect;

// 收集依赖
function track(target, key) {
  if (!activeEffect) return;
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let depSet = depsMap.get(key);
  if (!depSet) {
    depsMap.set(key, (depSet = new Set()));
  }
  // 将当前副作用函数添加到依赖集合中
  depSet.add(activeEffect);
  // 将依赖集合放到deps中，方便后面清理
  activeEffect.deps.push(depSet);
}

// 触发更新
function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  const effectsToRun = new Set();
  effects.forEach((effectFn) => {
    // fix proxy.count++ 类似这样的导致循环调用的情况
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn);
    }
  });
  // 执行副作用函数 effectFn
  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      // 如果存在调度器，则调用调度器，并传入副作用函数
      effectFn.options.scheduler(effectFn);
    } else {
      // 直接执行副作用函数
      effectFn();
    }
  });
}

// 将副作用函数从依赖集合中移除
function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const depSet = effectFn.deps[i];
    // 删除
    depSet.delete(effectFn);
  }
  // 重置deps;
  effectFn.deps.length = 0;
}

// 设置副作用函数
export function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    const res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };
  effectFn.options = options;
  effectFn.deps = []; // 记录依赖，方便清理 -- 分支切换情况
  if (!options.lazy) {
    // lazy: 是否懒计算
    effectFn();
  }
  return effectFn;
}

// 设置响应式
function createReactive(data, isShallow = false) {
  return new Proxy(data, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      // 收集依赖
      track(target, key);
      if (isShallow) {
        return res;
      }
      if (typeof res === 'object' && res !== null) {
        return reactive(res);
      }
      return res;
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      // 触发执行
      trigger(target, key);
      return res;
    },
  });
}

export function reactive(obj) {
  return createReactive(obj);
}

export function shallowReactive(obj) {
  return createReactive(obj, true);
}

export function computed(getter) {
  let dirty = true; // 是否需要重新计算
  let value; // 缓存的值
  const effectFn = effect(getter, {
    lazy: true, // 需要时，才重新执行
    scheduler() {
      if (!dirty) {
        // 依赖更新时，重新计算
        dirty = true;
        // 通知 value 的依赖
        trigger(obj, 'value');
      }
    },
  });

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      // 当读取 value 时，手动追踪依赖
      track(obj, 'value');
      return value;
    },
  };

  return obj;
}

// 递归遍历
function traverse(obj, seen = new Set()) {
  if (typeof obj !== 'object' || obj === null || seen.has(obj)) {
    return;
  }
  seen.add(obj);
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      traverse(obj[k], seen);
    }
  }
}

// 监听器
export function watch(source, cb, options = {}) {
  let getter;
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
  }
  let oldValue;
  let value;
  const job = () => {
    value = effectFn();
    cb(value, oldValue);
    oldValue = value;
  };

  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler: () => {
      // flush: post 异步执行，需要将回调放到微任务队列中，dom更新后执行
      if (options.flush === 'post') {
        Promise.resolve().then(job);
      } else {
        // sync 同步执行
        job();
      }
    },
  });
  if (options.immediate) {
    job();
  } else {
    oldValue = effectFn();
  }
}
