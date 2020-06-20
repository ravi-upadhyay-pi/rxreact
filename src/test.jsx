import {React, render} from 'index';
import {BehaviorSubject, Subject, Observable, interval} from 'rxjs';
import {tap, scan, map, takeUntil} from 'rxjs/operators';
import {ReplaySubject} from 'rxjs';
import {take, defaultIfEmpty} from 'rxjs/operators';

function getClean(parentClean=null) {
  const clean = new ReplaySubject().pipe(take(1), defaultIfEmpty(true));
  if (parentClean != null) {
    const subscription = parentClean.subscribe(clean);
    clean.subscribe(() => subscription.unsubscribe());
  }
  return clean;
};

function Timer({clean}) {
  const x = interval(1000).pipe(takeUntil(clean));
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

function Switch({clean}) {
  const state = new BehaviorSubject(true).pipe(
    scan(([state, oldclean, _]) => {
      if (oldclean != null) oldclean.complete(clean);
      const newclean = getClean(clean);
      const current = state === true
                    ? <Form />
                    : <Timer clean={newclean} />;
      return [!state, newclean, current];
    }, [true, null, null])
  );
  const component = state.pipe(map(s => s[2]));
  return (
    <div>
      <button onclick={() => state.next(true)}>Switch</button>
      {component}
    </div>
  );
}

function SwitchWithState({clean}) {
  const a = <Form />;
  const b = <Timer clean={clean}/>;
  const comp = new BehaviorSubject(true).pipe(
    scan((acc, curr) => acc == a ? b : a, a)
  );
  function onclick() {    
    comp.next(true);
  }
  return (
    <div>
      <button onclick={() => comp.next(true)}>
        Switch
      </button>
      {comp}
    </div>
  );
}

const clean = getClean();
render(<Switch clean={clean}/>, document.body);
setInterval(() => clean.complete(), 3000);
