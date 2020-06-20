
JSX based rendering library
===========================

This is a jsx based reactive rendering library. Since nowadays react and similar virtual dom libraries are
quite famous, I will try to introduce this with the context of react. The major difference from react is that
it does not have virtual dom. Also, unlike svelte/solid, there is no compilation step involved, other than the
jsx compilation to functions.


```js
import React, {render} from 'noreact';
import {BehaviorSubject, Subject, Observable} from 'rxjs';
import {tap, takeWhile, scan, map} from 'rxjs/operators';
```

The function timer will be called just once. In react a function is called again as soon as it's state, or props
change. Instead, we just call the function once, and it returns a normal dom node. Here `div` node has a reactive
child, `x`, which is `Observable` class from `rxjs` library. The rendering library detects that `x` is reactive,
so it listens to it, and calls `replaceWith` method of the child text node to replace with new element.

```js
function Timer({clean}) {
  const x = interval(1000).pipe(takeUntil(clean));
  return <div>{x}</div>;
}
```

Library is super small (excluding rxjs part). And `rxjs` is a library which should be present in any UI 
application. The library is just ~75 lines of code which includes propers spaces and indentation. 

Let's check the typical `Form` component. Instead of state, we can use a `Subject` (Subject is an observable 
which can be subscribed multiple times). Notice how the subject `x` looks similar to a typical store with actions.

To be as close to HTML conventions as possible, the event handlers are fully untouched. If an attribute is function
for example `update` is a function, so the dom node will register it is `node.oninput=update`, otherwise 
`node.setAttribute(key, value)` is used. Thus, there is no need to learn any other event handling.


```js
function Form() {
  const x = new BehaviorSubject({}).pipe(
    scan((obj, curr) => {
      return {
        ...obj,
        ...curr
      };        
    }, {
      firstname: '',
      lastname : '',
    })
  );
  const firstname = x.pipe(map(obj => obj.firstname));
  const lastname = x.pipe(map(obj => obj.lastname));
  function update(e) {
    x.next({[e.target.name]: e.target.value});
  }
  return (
    <div onclick={onclick}>
      <input name="firstname" oninput={update} />
      <br />
      <input name="lastname"  oninput={update} />
      <br />
      Hi {lastname}, {firstname}
    </div>
  );
}
```


Cleanup logic is handled by `defer` function is is passed as prop. Note that, in `Switch` component, each time, 
switch button is clicked, the `comp` is updated with a new component instance. So if you switch back to timer
component, it will restart from `0`. Also, whenever there is update on `{comp}`, everything that was deferred for
cleanup will be cleaned up for that older component. Whenever a functional component is called, two pair of 
functions are created `defer` and `clean`. `defer` is passed to the function, which can register the resources
which needs to be cleaned up. And `clean` function is attached to the resultant dom node.


```js
function Switch() {
  let bool = true;
  let comp = new BehaviorSubject(<Timer />);
  function onclick() {
    bool = !bool;
    if (bool === true) {
      comp.next(<Form />);
    } else {
      comp.next(<Timer />);
    }
  }
  return (
    <div>
      <button onclick={onclick}>Switch</button>
      {comp}
    </div>
  );
}
```


`SwitchWithState` component is similar to the above `Switch` component. But there is a difference. When switch
button is clicked, and the `comp` is updated, the state of the component which is being unmounted is preserved, and
in turn the component which is being mounted again is also in working state. This happens because when we are 
creating `Timer` component, we are passing `defer` function ourselves, which means that the resources which are 
deferred in the Timer component will be cleaned only when it's corresponding clean function will be called. And
the corresponding clean function will be called only when `SwitchWithState` is replaced with another node in dom.


```js
function SwitchWithState({defer}) {
  const a = <Form  defer={defer}/>;
  const b = <Timer defer={defer}/>;
  const comp = new BehaviorSubject(true).pipe(
    scan((acc, curr) => acc == a ? b : a, a)
  );
  function onclick() {    
    comp.next(true);
  }
  return (
    <div>
      <button onclick={() => comp.next(true)}>Switch</button>
      {comp}
    </div>
  );
}


render(<SwitchWithState />, document.getElementById('root'));
```
