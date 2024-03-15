import { isObject, def } from './utils.js';
import Dep from './Dep.js';
import arrayMethods from './arrayMethods.js';

class Observer {
  constructor(value) {
    this.value = value;
    // 存放依赖
    this.dep = new Dep();
    // 添加不可枚举 __ob__ 属性为当前实例，以便在数组原型方法里通知依赖
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      // 修改数组原型
      value.__proto__ = arrayMethods;
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  walk(data) {
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        defineReactive(data, key, data[key]);
      }
    }
  }

  /**
   * 监听数组里的每一项
   * @param {*} value
   */
  observeArray(value) {
    for (let item of value) {
      observe(item);
    }
  }
}

/**
 * 为value创建一个observer，如果已经存在则直接返回
 */
function observe(value) {
  if (!isObject(value)) {
    return;
  }
  if (value.hasOwnProperty('__ob__') && value.__ob__ instanceof Observer) {
    return value.__ob__;
  }
  return new Observer(value);
}

// 设置响应式
function defineReactive(obj, name, value) {
  const dep = new Dep();
  const childOb = observe(value);
  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable: true,
    get() {
      // get 时收集依赖
      dep.depend();

      if (childOb) {
        childOb.dep.depend();
      }

      return value;
    },
    set(newValue) {
      if (newValue === value) {
        return;
      }
      value = newValue;
      // set 时通知依赖更新
      dep.notify();
    },
  });
}

export default observe;
