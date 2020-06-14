const matchTemplate = (template, route) => {
  let params = {};
  if (template.length !== route.length) {
    return false;
  }
  for (let i = 0; i < template.length; i++) {
    let idx = template[i].indexOf(':');
    if (idx === -1) {
      if (template[i] !== route[i]) {
        return false;
      }
    } else {
      if (template[i].substring(0, idx) !== route[i].substring(0, idx)) {
        return false;
      }
      params[template[i].substring(idx+1)] = route[i].substring(idx);
    }            
  }
  return [true, params];
};

const matchTemplates = (templates) => {
  let path = window
    .location.pathname
    .split('/')
    .filter(a => a.length > 0);
  let params = {};
  window
    .location.search.substring(1)
    .split('&')
    .map(a => a.split('='))
    .forEach(p => params[p[0]] = p[1]);
  for (const key of Object.keys(templates)) {
    let template = key.split('/').filter(a => a.length > 0);
    let res = matchTemplate(template, path);
    if (res !== false) {
      params = {
        ...params,
        ...res[1]
      };
      return [templates[key], params];
    }
  }
  return false;
};

export default matchTemplates;
