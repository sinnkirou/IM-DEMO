// interface StorageFn {
//   data: any;
//   namespace: string;
//   set: (name: string, value: any) => void;
//   get: (name: string) => void;
//   remove: (name: string) => void;
//   clear: (name: string) => void;
// }

class LocalStorage {
  public data: any = {};
  public namespace: string;
  constructor(namespace: string) {
    this.data = {};
    this.namespace = namespace;
    this.getLocalStorage();
  }
  public set(name: string, value: any) {
    this.data[name] = value;
    this.setLocalStorage();
    return this;
  }
  public get(name: string) {
    return name ? this.data[name] : this.data;
  }
  public remove(name: string) {
    delete this.data[name];
    this.setLocalStorage();
    return this;
  }
  public clear() {
    this.data = {};
    this.setLocalStorage();
  }
  public setLocalStorage() {
    window.localStorage.setItem(this.namespace, JSON.stringify(this.data));
  }
  public getLocalStorage() {
    this.data = JSON.parse(window.localStorage.getItem(this.namespace) || '{}');
  }
}

class SessionStorage {
  public data: any = {};
  public namespace: any;
  constructor(namespace: string) {
    this.data = {};
    this.namespace = namespace;
    this.getSessionStorage();
  }
  public set(name: string, value: any) {
    this.data[name] = value;
    this.setSessionStorage();
    return this;
  }
  public get(name: string) {
    return name ? this.data[name] : this.data;
  }
  public remove(name: string) {
    delete this.data[name];
    this.setSessionStorage();
    return this;
  }
  public clear() {
    this.data = {};
    this.setSessionStorage();
  }
  public setSessionStorage() {
    window.sessionStorage.setItem(this.namespace, JSON.stringify(this.data));
  }
  public getSessionStorage() {
    this.data = JSON.parse(window.sessionStorage.getItem(this.namespace) || '{}');
  }
}

class CookieStorage {
  public set(cname: string, cvalue, exdays = 1) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + '; ' + expires;
    return this;
  }
  public get(cname: string) {
    const name = cname + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      const c = ca[i].trim();
      if (c.indexOf(name) === 0) { return c.substring(name.length, c.length); }
    }
    return '';
  }
  public remove(cname: string) {
    this.set(cname, this.get(cname), -1);
    return this;
  }
  public clear() {
    document.cookie = '';
  }
}

class Storage {
  public local: any;
  public session: any;
  public cookie: any;
  constructor(namespace: string) {
    this.local = new LocalStorage(namespace);
    this.session = new SessionStorage(namespace);
    this.cookie = new CookieStorage();
  }
}

export default new Storage('COV-DEMO');
