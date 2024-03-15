const proto = Array.prototype;
// 新的原型对象
const arrayMethods = Object.create(proto);

// 复写可修改数组的方法，调用时通知依赖
['push', 'pop', 'shift', 'unshift', 'sort', 'splice', 'reverse'].forEach(
  (fnName) => {
    const original = proto[fnName];
    Object.defineProperty(arrayMethods, fnName, {
      configurable: true,
      enumerable: false,
      writable: true,
      value(...args) {
        const result = original.apply(this, args);
        // 拿到observer -> dep
        const ob = this.__ob__; 
        // 监听新增的元素
        let inserted;
        switch (fnName) {
          case 'push':
          case 'unshift':
            inserted = args;
            break;
          case 'splice':
            inserted = args.slice(2);
            break;
        }
        if (inserted) {
          ob.observeArray(inserted); // 新增的元素也转换成响应式
        }
        // 通知依赖
        ob.dep.notify();
        return result;
      },
    });
  }
);

export default arrayMethods;
