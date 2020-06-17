import React, {render, getClean} from 'noreact';
import {BehaviorSubject, Subject, Observable} from 'rxjs';
import {tap, takeWhile, scan, map} from 'rxjs/operators';

function Timer({defer}) {
  const x = new Observable(subscriber => {    
    let i = 0;
    subscriber.next(i);
    const handle = setInterval(
      () => subscriber.next(++i),
      1000);
    defer('timer interval cleared', handle);
  });
  return <div>{x}</div>;
}

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

function SwitchWithState({defer}) {
  const a = <div><Form  defer={defer}/></div>;
  const b = <div><Timer defer={defer}/></div>;
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
