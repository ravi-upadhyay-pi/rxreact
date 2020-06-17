import {Observable, Subject, Subscription, asyncScheduler, of} from 'rxjs';
import {scan, finalize, observeOn} from 'rxjs/operators';
import getClean from 'cleaner';

function render(component, host) {
  if (component instanceof Observable) {
    return renderReactive(component, host);
  }
  if (component.nodeType == null) {
    component = document.createTextNode(component);
    host.appendChild(component);
    return;
  }
  if (component.tagName === "FRAGMENT") {
    for (let i = 0; i < component.childNodes.length; i++) {
      render(component.childNodes[i], host);
    }
    return;
  }  
  host.appendChild(component);
}

function renderReactive(component, host) {
  let pseudoNode = document.createElement("div");
  pseudoNode.style.display = "none";
  host.appendChild(pseudoNode);
  component.subscribe(newcomponent => {
    if (newcomponent.nodeType == null) {
      if (typeof newcomponent === "object") {
        throw {
          msg: "reactive component should not publish objects",
          published: newcomponent};
      }
      newcomponent = document.createTextNode(newcomponent);
    }
    pseudoNode.replaceWith(newcomponent);
    if (pseudoNode.clean != null) {
      pseudoNode.clean();
    }
    pseudoNode = newcomponent;
  });
}

function h(tag, attrs, ...children) {
  if (tag === undefined) {
    tag = "fragment";
  }
  if (typeof tag === "function") {
    const [defer, clean, signal] = getClean();
    const component = tag({defer, ...attrs}, ...children);
    component.clean = clean;
    return component;
  } else if (typeof tag === "string") {
    const [defer, clean, signal] = getClean();
    let element = document.createElement(tag);
    for (let name in attrs) {
      setAttribute(element, name, attrs[name]);
    }
    for (let i = 0; i < children.length; i++) {
      defer(children[i].clean);
      render(children[i], element);
    }
    defer(element);
    element.clean = clean;
    return element;
  } else {
    throw {
      msg: "tag is not supported",
      tag: tag
    };
  }
}

function setAttribute (element, name, value) {
  if (name === 'ref') {
    value.next(element);
  } else if (value instanceof Observable) {
    const subscription = value.subscribe(
      v => setAttribute(element, name, v, defer)
    );
  } else if (typeof value === "function") {
    element[name] = value;
  } else if(name === 'class') {
    element.className = value;
  } else {
    element.setAttribute(name, value);
  }
}

const React = {
  createElement: h
};

export default React;

export {
  render,
};
