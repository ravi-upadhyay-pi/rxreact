import React, {render, getClean} from 'noreact';
import {BehaviorSubject, Subject} from 'rxjs';
import {tap, takeWhile, scan, map} from 'rxjs/operators';

const Test0 = <div>Hello World</div>;

function Test1() {
  return <div>Hello World</div>;
}

function Test2() {
  return (
    <>
      Fragment
    </>
  );
}

function Test3() {
  const x = 'Test2';
  return (
    <div>
      {x}
      <Test2 />
    </div>
  );
}

function Test4({defer}) {
  let i = 0;
  const x = new BehaviorSubject(0);
  const itr = setInterval(() => {
    x.next(++i);
  }, 1000);
  defer(i);
  return <div>{x}</div>;
}

function Test5({defer}) {
  const test4 = <Test4 defer={defer} />;
  return (
    <div>
      <h1>Test4</h1>
      {test4}
    </div>
  );
}

function Test6({defer}) {
  let i = 0;
  let counter = new BehaviorSubject(i);
  const x = new BehaviorSubject(<div></div>);
  const z = new BehaviorSubject(x);
  const itr = setInterval(() => {
    counter.next(++i);
  }, 1000);
  const subs1 = counter.subscribe(v => x.next(<div>{v}</div>));
  const subs2 = counter.subscribe(v => {
    if (v == 3) {
      z.next(<div>new</div>);
    }
  });
  defer('closed itr', itr, 'closed subs1', subs1, 'closed subs2', subs2);
  return <div>counter is {z}</div>;
};

function Test7({defer}) {
  const x = new BehaviorSubject({}).pipe(
    scan((obj, curr) => {
      return {
        ...obj,
        ...curr
      };        
    }, {
      firstname: '',
      lastname: '',
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

render(<Test7 />, document.getElementById('root'));
