import {Observable, Subscription, Subject} from 'rxjs';

const resolveDefer = (clean) => (f) => {
  if (f == null) {
    return;
  }
  if (f instanceof Observable) {
    f.pipe(
      finalize(() => {
        clean();
      })
    ).subscribe();
    return;
  }
  if (f instanceof Subscription) {
    return () => f.unsubscribe();
  }
  switch (typeof f) {
    case "function": return f;
    case "number"  : return () => clearInterval(f);
    case "string"  : return () => console.log(f);
  }
  throw {msg: "defer argument can't be resolved", arg: f};
};

export default function getClean(parentSignal=null) {
  const signal = new Subject();
  const d = [];
  const clean = () => {
    signal.complete();
    while(d.length > 0) {
      d.pop()();
    }
  };
  const resolve = resolveDefer(clean);  
  const defer = (...f) => {
    for (let i = 0; i < f.length; i++) {
      let resolved = resolve(f[i]);
      if (resolved != null) {
        d.push(resolved);
      }
    }
  };
  defer(parentSignal);  
  return [defer, clean, signal];
};
