/**
 * 管理依赖
 */
let uid = 0;
class Dep {
  constructor() {
    this.subs = [];
    this.id = ++uid;
  }

  static target = null;

  depend() {
    if (Dep.target) {
      // Watcher实例
      Dep.target.addDep(this);
    }
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  removeSub(sub) {
    this.subs = this.subs.filter((item) => item !== sub);
  }

  notify() {
    this.subs.forEach((sub) => sub.update());
  }
}

export default Dep;
