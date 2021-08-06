import {React} from "./reactrx";
import {Subject} from "rxjs";
import {map, startWith} from "rxjs/operators";

interface RouteProp {
  route: Subject<string>;
}

interface PageProp extends RouteProp {
  params: Map<string, string>;
}

interface RouterProp extends RouteProp {
  fallback?: () => JSX.Element;
}

function Router({route, fallback}: RouterProp, ...children: [string, () => JSX.Element][]): JSX.Element {
  const routeMap: Map<string, () => JSX.Element> = new Map();
  for (let i = 0; i < children.length; i++) {
    routeMap.set(children[i][0], children[i][1]);
  }
  fallback = fallback || (() => <div>Location Not Found</div>);  
  return route.pipe(
    startWith(window.location.pathname),
    map(value => {
      const [Selected, params] = matchTemplates(value, routeMap, fallback);
      return <Selected {...{params, route}}/>;
    })
  );
};

type Component = (props: PageProp) => JSX.Element;

function Route({path, component}: {path: string, component: Component}): [string, Component] {
  return [path, component];
}

function matchTemplates(
  route: string, 
  templates: Map<string, () => JSX.Element>, 
  fallback: () => JSX.Element): [Component, Map<string, string>] 
{
  let path = route.split('/').filter(a => a.length > 0);
  let params: Map<string, string> = new Map();
  window.location.search.substring(1).split('&')
      .filter(s => s !== "")
      .map(a => a.split('='))
      .forEach(p => params.set(p[0], p[1]));
  for (let [key, value] of templates) {
    let template = key.split('/').filter(a => a.length > 0);
    let res = matchTemplate(template, path);
    if (res[0] !== false) {
      for (const [key, value] of res[1]) {
        params.set(key, value);
      }
      return [value, params];
    }
  }
  return [fallback, params];
};

function matchTemplate(template: string[], route: string[]): [boolean, Map<string, string>] {
  let params: Map<string, string> = new Map();
  if (template.length !== route.length) {
    return [false, params];
  }
  for (let i = 0; i < template.length; i++) {
    let idx = template[i].indexOf(':');
    if (idx === -1) {
      if (template[i] !== route[i]) {
        return [false, params];
      }
    } else {
      if (template[i].substring(0, idx) !== route[i].substring(0, idx)) {
        return [false, params];
      }
      params.set(template[i].substring(idx+1), route[i].substring(idx));
    }            
  }
  return [true, params];
};

class BrowserHistory extends Subject<string> {
  popStateListener: () => void;
  
  constructor() {
    super();
    this.popStateListener = () => this.next(window.location.pathname);
    window.addEventListener('popstate', this.popStateListener);
    this.subscribe((route: string) => window.history.pushState(null, null, route));
  }

  stop() {
    window.removeEventListener('popstate', this.popStateListener);
    this.unsubscribe();
  }
}

export {
  Router,
  Route,
  RouterProp,
  PageProp,
  RouteProp,
  BrowserHistory,
}
