import Dep from './Dep.js';

// 解析path
function parsePath(path) {
  const reg = /[^\w.$]/;
  if (reg.test(path)) {
    return;
  }
  const segments = path.split('.');
  return function traverse(obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) {
        return;
      }
      obj = obj[segments[i]];
    }
    return obj;
  };
}

class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    this.deps = [];
    this.depIds = new Set(); // 存放dep id 防止收集依赖

    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
    }
    this.value = this.get();
    this.cb = cb;
  }

  addDep(dep) {
    const id = dep.id;
    if (!this.depIds.has(id)) {
      // 防止重复
      this.depIds.add(id);
      this.deps.push(dep);
      dep.addSub(this);
    }
  }

  // 从所有依赖项的Dep列表中将自己移除
  teardown() {
    let i = this.deps.length;
    while(i--) {
      this.deps[i].removeSub(this);
    }
  }

  get() {
    // 将当前实例设置为Dep.target即依赖，获取数据时，会把当前实例添加到Dep实例的subs中
    Dep.target = this;
    const value = this.getter.call(this.vm, this.vm);
    Dep.target = null;
    return value;
  }

  update() {
    const oldValue = this.value;
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldValue);
  }
}

export default Watcher;
