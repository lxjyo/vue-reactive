const jobQueue = new Set(); // 定义一个队列
const p = Promise.resolve();
let isFlushing = false; // 代表是否正在刷新队列
export default function flushingQueue(job) {
  jobQueue.add(job);
  // 如果正在执行，则什么都不做
  if (isFlushing) return;
  isFlushing = true;
  // 执行队列
  p.then(() => {
    jobQueue.forEach((job) => job());
  }).finally(() => {
    isFlushing = false;
  })
}
