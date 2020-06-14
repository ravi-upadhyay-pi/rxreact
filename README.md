
JSX based rendering library
===========================

This is an experimental project which aims to provide jsx based ui-development.

The basic difference when compared with other such libraries/frameworks is 
that it does not consist of virtual dom behind the scenes. Also unlike other
frameworks like svelte/solidjs it does not depend on a framework/library 
specific compiler to make it work without virtual dom.

It's core is powered by rxjs. Some examples on how to use them are listed below:

+ This is the most basic jsx syntax. Here we use basic div component(tag). Also note
that `Test1()` returns a dom node directly which is inserted in dom.
```
function Test1() {
  return (
    <div>Hello World</div>
  );
}

document.getElementById('root').appendChild(<Test1 />);
```

+ Use a function as a tag.
```
function Test2() {
  return (
    <div>
      <h2>Test2</h2>
      <Test1 />
    </div>
  );
}
```
+ Store dom nodes in variable and then use them as children.
```
function Test3() {
  const x = 'Test2';
  const y = <Test2 />;
  return (
    <div>
    {x}
    {y}
    </div>
  );
}
```
+ This is an example of a dynamic component. All the functional components receive a defer function
    inside the props, which they can use to register their cleanup logic/resources. `defer` accepts numbers
    representing `setInterval` handle, or a function, or a subscription on which cleanup is done when the 
    node is going to be removed from the dom tree.
```
function Test4({defer}) {
  let i = 0;
  const x = new BehaviorSubject(0);
  const itr = setInterval(() => {
    x.next(++i);
  }, 1000);
  defer(i);
  return <div>{x}</div>;
}
```
+ Use dynamic components as children.
```
function Test5({defer}) {
  const test4 = <Test4 />;
  return (
    <div>
      <h1>Test4</h1>
      {test4}
    </div>
  );
}
```

    
