import observe from './Observer.js';
import Watcher from './Watcher.js';

const data = {
  age: 20,
  work: {
    salary: 20000,
  },
  hobbies: ['swimming'],
  items: [
    {
      id: 1,
    },
  ],
};

observe(data);

new Watcher(data, 'work.salary', (newValue, oldValue) => {
  console.log('salary:', newValue, oldValue);
});

// new Watcher(data, 'age', (newValue, oldValue) => {
//   console.log('age:', newValue, oldValue);
// });

new Watcher(data, 'hobbies', (newValue, oldValue) => {
  console.log('hobbies:', newValue, oldValue);
});

new Watcher(
  data,
  () => {
    return data.items[0].id + data.age;
  },
  (newValue, oldValue) => {
    console.log('change:', newValue, oldValue);
  }
);

setTimeout(() => {
  data.work.salary += 2000;
}, 2000);

setTimeout(() => {
  data.age += 2;
}, 3000);

setTimeout(() => {
  data.hobbies.push('dancing');
}, 4000);

setTimeout(() => {
  data.items[0].id = 3;
}, 4000);
